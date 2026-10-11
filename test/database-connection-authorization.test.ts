import assert from "node:assert/strict";
import test from "node:test";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DatabaseConnectionController } from "../src/database-connection/database-connection.controller";
import { RolesGuard } from "../src/auth/guards/roles.guard";
import { DatabaseConnection } from "../src/database-connection/domain/entities/database-connection";
import { DatabaseConnectionForbiddenError } from "../src/database-connection/domain/errors/database-connection-forbidden-error";
import { GetDatabaseConnectionByIdUseCase } from "../src/database-connection/application/use-cases/get-database-connection-by-id/get-database-connections-by-id.use-case";
import { GetDatabaseMetricsUseCase } from "../src/database-connection/application/use-cases/get-database-metrics/get-database-metrics.use-case";
import { DatabaseProvider } from "../src/database-connection/domain/enums/database-provider.enum";

function contextFor(role: "ADMIN" | "MEMBER" | "VIEWER", handlerName: "create" | "delete" | "test"): ExecutionContext {
  const handler = DatabaseConnectionController.prototype[handlerName];
  return {
    getHandler: () => handler,
    getClass: () => DatabaseConnectionController,
    switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }),
  } as unknown as ExecutionContext;
}

test("MEMBER and ADMIN can reach connection create, delete, and test routes", () => {
  const guard = new RolesGuard(new Reflector());
  for (const handler of ["create", "delete", "test"] as const) {
    for (const role of ["ADMIN", "MEMBER"] as const) {
      assert.equal(guard.canActivate(contextFor(role, handler)), true, `${role} ${handler}`);
    }
    assert.throws(() => guard.canActivate(contextFor("VIEWER", handler)), ForbiddenException);
  }
});
test("connection ID reads return 403 for another MEMBER owner", async () => {
  const resource = DatabaseConnection.restore({ id: "00000000-0000-4000-8000-000000000003", name: "primary", provider: DatabaseProvider.POSTGRESQL, host: "db.example.test", port: 5432, database: "metrics", username: "member", password: "unused", userId: "00000000-0000-4000-8000-000000000002" });
  const useCase = new GetDatabaseConnectionByIdUseCase({ findById: async () => resource } as never);
  await assert.rejects(() => useCase.execute({ id: resource.id, userId: "00000000-0000-4000-8000-000000000001" }), (error: unknown) => error instanceof DatabaseConnectionForbiddenError && error.statusCode === 403);
});
test("MEMBER metrics require ownership and collect successfully for own connection", async () => {
  const own = DatabaseConnection.restore({ id: "00000000-0000-4000-8000-000000000003", name: "primary", provider: DatabaseProvider.POSTGRESQL, host: "db.example.test", port: 5432, database: "metrics", username: "member", password: "unused", userId: "00000000-0000-4000-8000-000000000001" });
  let collected = 0;
  const useCase = new GetDatabaseMetricsUseCase({ findById: async () => own } as never, { get: () => ({ collect: async () => { collected++; return { databaseVersion: "v", tablesCount: 0, viewsCount: 0, schemasCount: 0, indexesCount: 0, functionsCount: 0, databaseSize: 0, activeConnections: 0 }; } }) } as never, { evaluate: () => ({ status: "HEALTHY", message: "ok", checkedAt: new Date() }) } as never);
  const result = await useCase.execute({ connectionId: own.id, userId: own.userId });
  assert.equal(result.databaseVersion, "v");
  await assert.rejects(() => useCase.execute({ connectionId: own.id, userId: "00000000-0000-4000-8000-000000000002" }), (error: unknown) => error instanceof DatabaseConnectionForbiddenError && error.statusCode === 403);
  assert.equal(collected, 1);
});