import assert from "node:assert/strict";
import test from "node:test";
import { ExecutionContext, HttpStatus } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  ThrottlerException,
  ThrottlerGuard,
} from "@nestjs/throttler";
import { ThrottlerStorage } from "@nestjs/throttler";
import { AuthController } from "../src/auth/auth.controller";
import { configureExpressTrustProxy } from "../src/shared/config/express-trust-proxy";

test("AuthController endpoints expose their configured rate limits", () => {
  const routes = [
    ["login", 5, 60_000],
    ["register", 3, 60 * 60 * 1000],
    ["resendVerification", 3, 60 * 60 * 1000],
    ["verifyEmail", 5, 15 * 60 * 1000],
  ] as const;

  for (const [route, limit, ttl] of routes) {
    const handler = AuthController.prototype[route];
    assert.equal(
      Reflect.getMetadata("THROTTLER:LIMITdefault", handler),
      limit,
      `${route} limit`,
    );
    assert.equal(
      Reflect.getMetadata("THROTTLER:TTLdefault", handler),
      ttl,
      `${route} window`,
    );
  }
});

test("ThrottlerGuard returns HTTP 429 after the real login route limit", async () => {
  const hits = new Map<string, number>();
  const storage: ThrottlerStorage = {
    increment: async (key, ttl, limit, _blockDuration, _throttlerName) => {
      const totalHits = (hits.get(key) ?? 0) + 1;
      hits.set(key, totalHits);
      return {
        totalHits,
        timeToExpire: ttl,
        isBlocked: totalHits > limit,
        timeToBlockExpire: ttl,
      };
    },
  };
  const guard = new ThrottlerGuard(
    {
      throttlers: [{ name: "default", limit: 60, ttl: 60_000 }],
      storage,
    },
    storage,
    new Reflector(),
  );
  await guard.onModuleInit();
  const context = {
    getHandler: () => AuthController.prototype.login,
    getClass: () => AuthController,
    switchToHttp: () => ({
      getRequest: () => ({
        ip: "127.0.0.1",
        headers: { "user-agent": "unit-test" },
      }),
      getResponse: () => ({ setHeader: () => undefined }),
    }),
  } as unknown as ExecutionContext;

  for (let attempt = 0; attempt < 5; attempt++) {
    assert.equal(await guard.canActivate(context), true);
  }
  await assert.rejects(
    () => guard.canActivate(context),
    (error: unknown) =>
      error instanceof ThrottlerException &&
      error.getStatus() === HttpStatus.TOO_MANY_REQUESTS &&
      !error.message.includes("127.0.0.1"),
  );
});

test("Express trusts exactly one ALB proxy hop", () => {
  const settings: Array<[string, number]> = [];
  configureExpressTrustProxy({
    set: (setting, hops) => {
      settings.push([setting, hops]);
    },
  });

  assert.deepEqual(settings, [["trust proxy", 1]]);
});
