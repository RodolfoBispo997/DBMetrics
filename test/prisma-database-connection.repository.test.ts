import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_CREDENTIALS_KEY = Buffer.alloc(32, 9).toString("base64");

import { DatabaseConnection } from "../src/database-connection/domain/entities/database-connection";
import { DatabaseProvider } from "../src/database-connection/domain/enums/database-provider.enum";
import { PrismaDatabaseConnectionRepository } from "../src/database-connection/infra/repositories/prisma-database-connection.repository";
import { PrismaService } from "../src/shared/infra/database/prisma/prisma.service";
import { DatabaseCredentialsCipherService } from "../src/shared/security/database-credentials/database-credentials-cipher.service";

const cipher = new DatabaseCredentialsCipherService();

test("persists encrypted credentials and restores plaintext only in memory", async () => {
  let stored: Record<string, unknown> | undefined;
  const prisma = {
    databaseConnection: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        stored = { ...data };
      },
      findUnique: async () => stored,
      update: async ({ data }: { data: Record<string, unknown> }) => {
        stored = { ...stored, ...data };
      },
    },
  } as unknown as PrismaService;
  const repository = new PrismaDatabaseConnectionRepository(prisma, cipher);
  const connection = DatabaseConnection.create({
    name: "Test connection",
    provider: DatabaseProvider.POSTGRESQL,
    host: "localhost",
    port: 5432,
    database: "dbmetrics",
    username: "postgres",
    password: "original-password",
    userId: "550e8400-e29b-41d4-a716-446655440000",
  });

  await repository.save(connection);
  const firstStoredPassword = stored?.password as string;
  assert.match(firstStoredPassword, /^v1:/);
  assert.notEqual(firstStoredPassword, "original-password");

  const restored = await repository.findById(connection.id);
  assert.equal(restored?.password, "original-password");

  await repository.update(restored!);
  const secondStoredPassword = stored?.password as string;
  assert.match(secondStoredPassword, /^v1:/);
  assert.notEqual(secondStoredPassword, firstStoredPassword);
  assert.equal(cipher.decrypt(secondStoredPassword), "original-password");

  restored!.update({
    name: "Test connection",
    provider: DatabaseProvider.POSTGRESQL,
    host: "localhost",
    port: 5432,
    database: "dbmetrics",
    username: "postgres",
    password: "new-password",
  });
  await repository.update(restored!);

  assert.equal(cipher.decrypt(stored?.password as string), "new-password");
});
