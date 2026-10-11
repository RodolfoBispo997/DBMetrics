import assert from "node:assert/strict";
import test from "node:test";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Reflector } from "@nestjs/core";
import type { ThrottlerStorage } from "@nestjs/throttler";
import { DatabaseConnection } from "./src/database-connection/domain/entities/database-connection";
import { DatabaseProvider } from "./src/database-connection/domain/enums/database-provider.enum";
import { UserAwareThrottlerGuard } from "./src/auth/guards/user-aware-throttler.guard";
import { JwtAuthGuard } from "./src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "./src/auth/guards/roles.guard";
import { DatabaseConnectionController } from "./src/database-connection/database-connection.controller";
import { DatabaseMetricController } from "./src/database-metric/database-metric.controller";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET ??= "test-jwt-secret";
process.env.DATABASE_CREDENTIALS_KEY ??= `${"A".repeat(43)}=`;
process.env.DATABASE_METRICS_CONNECTION_TIMEOUT_MS = "20";

const connection = (provider: DatabaseProvider) => DatabaseConnection.restore({
  id: "00000000-0000-4000-8000-000000000003",
  name: "test",
  provider,
  host: "127.0.0.1",
  port: provider === DatabaseProvider.MYSQL ? 3306 : 5432,
  database: "metrics",
  username: "tester",
  password: "not-a-real-secret",
  userId: "00000000-0000-4000-8000-000000000001",
});

test("MySQL connection tester enforces timeout and closes its probe", async () => {
  const { MysqlConnectionTester } = await import("./src/database-connection/infra/services/mysql-connection-tester");
  let closed = 0;
  const tester = new MysqlConnectionTester(() => ({
    run: () => new Promise<void>(() => undefined),
    cancel: () => { closed++; },
  }));
  const result = await tester.test(connection(DatabaseProvider.MYSQL));
  assert.deepEqual(result, { success: false, message: "Connection test timed out" });
  assert.equal(closed, 1);
});

test("PostgreSQL connection tester enforces timeout and closes its probe", async () => {
  const { PostgresConnectionTester } = await import("./src/database-connection/infra/services/postgres-connection-tester");
  let closed = 0;
  const tester = new PostgresConnectionTester(() => ({
    run: () => new Promise<void>(() => undefined),
    cancel: () => { closed++; },
  }));
  const result = await tester.test(connection(DatabaseProvider.POSTGRESQL));
  assert.deepEqual(result, { success: false, message: "Connection test timed out" });
  assert.equal(closed, 1);
});

class ThrottlerHarness extends UserAwareThrottlerGuard {
  constructor() {
    const counts = new Map<string, number>();
    const storage = {
      increment: async (key: string, _ttl: number, limit: number) => {
        const totalHits = (counts.get(key) ?? 0) + 1;
        counts.set(key, totalHits);
        return { totalHits, timeToExpire: 1000, isBlocked: totalHits > limit, timeToBlockExpire: 1000 };
      },
    } as ThrottlerStorage;
    super([{ name: "default", limit: 1, ttl: 60_000 }], storage, new Reflector());
    void this.onModuleInit();
  }

  tracker(request: Record<string, any>) {
    return this.getTracker(request);
  }

  check(request: Record<string, any>) {
    const context = {
      switchToHttp: () => ({ getRequest: () => request, getResponse: () => ({}) }),
      getClass: () => ThrottlerHarness,
      getHandler: () => this.check,
    } as never;
    return this.handleRequest({
      context,
      limit: 1,
      ttl: 60_000,
      blockDuration: 60_000,
      throttler: { name: "default", setHeaders: false },
      getTracker: (req) => this.getTracker(req),
      generateKey: (_context, tracker, name) => `${name}:${tracker}`,
    });
  }
}

test("throttle exceeds for same user, separates authenticated users, and falls back to IP", async () => {
  const guard = new ThrottlerHarness();
  const userOne = { user: { userId: "member-1" }, ip: "198.51.100.1" };
  const userTwo = { user: { userId: "member-2" }, ip: "198.51.100.1" };
  await guard.check(userOne);
  await assert.rejects(guard.check(userOne), (error: any) => error.getStatus() === 429);
  await guard.check(userTwo);
  assert.equal(await guard.tracker(userOne), "user:member-1");
  assert.equal(await guard.tracker({ ip: "203.0.113.9" }), "ip:203.0.113.9");
});

test("expensive routes retain authentication and ownership guards with 5/minute limits", () => {
  const checks = [
    [DatabaseConnectionController.prototype.test, [JwtAuthGuard, RolesGuard, UserAwareThrottlerGuard]],
    [DatabaseConnectionController.prototype.metrics, [JwtAuthGuard, UserAwareThrottlerGuard]],
    [DatabaseMetricController.prototype.collect, [JwtAuthGuard, UserAwareThrottlerGuard]],
  ] as const;
  for (const [handler, requiredGuards] of checks) {
    const guards = Reflect.getMetadata(GUARDS_METADATA, handler) as unknown[];
    for (const required of requiredGuards) assert.ok(guards.includes(required));
    assert.equal(Reflect.getMetadata("THROTTLER:LIMITdefault", handler), 5);
    assert.equal(Reflect.getMetadata("THROTTLER:TTLdefault", handler), 60_000);
  }
});
