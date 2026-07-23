import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseConnection } from "../src/database-connection/domain/entities/database-connection";
import { DatabaseProvider } from "../src/database-connection/domain/enums/database-provider.enum";
import { DatabaseConnectionNotFoundError } from "../src/database-connection/domain/errors/database-connection-not-found-error";
import { UserNotFoundError } from "../src/database-connection/domain/errors/user-not-found-error";
import { CreateDatabaseConnectionUseCase } from "../src/database-connection/application/use-cases/create-database-connection/create-database-connection.use-case";
import { UpdateDatabaseConnectionUseCase } from "../src/database-connection/application/use-cases/update-database-connection/update-database-connection.use-case";
import { DeleteDatabaseConnectionUseCase } from "../src/database-connection/application/use-cases/delete-database-connection/delete-database-connection.use-case";
import { GetDatabaseConnectionByIdUseCase } from "../src/database-connection/application/use-cases/get-database-connection-by-id/get-database-connections-by-id.use-case";
import { ListDatabaseConnectionsUseCase } from "../src/database-connection/application/use-cases/list-database-connections/list-database-connections.use-case";
import { TestDatabaseConnectionUseCase } from "../src/database-connection/application/use-cases/test-database-connection/test-database-connection.use-case";

const owner = "00000000-0000-4000-8000-000000000001";
const other = "00000000-0000-4000-8000-000000000002";
const makeConnection = (userId = owner) =>
  DatabaseConnection.restore({
    id: "00000000-0000-4000-8000-000000000003",
    name: "Primary",
    provider: DatabaseProvider.POSTGRESQL,
    host: "localhost",
    port: 5432,
    database: "metrics",
    username: "db-user",
    password: "secret",
    userId,
  });
const request = {
  name: "Primary",
  provider: DatabaseProvider.POSTGRESQL,
  host: "localhost",
  port: 5432,
  database: "metrics",
  username: "db-user",
  password: "secret",
  userId: owner,
};

test("CreateDatabaseConnectionUseCase saves an authorized connection and returns public fields", async () => {
  let saved: DatabaseConnection | undefined;
  const useCase = new CreateDatabaseConnectionUseCase(
    {
      save: async (connection) => {
        saved = connection;
      },
      findById: async () => null,
      findManyByUserId: async () => [],
      findAll: async () => [],
      update: async () => undefined,
      delete: async () => undefined,
    },
    {
      findById: async () => ({}) as never,
      findByEmail: async () => null,
      save: async () => undefined,
    },
  );
  const result = await useCase.execute(request);
  assert.equal(saved?.userId, owner);
  assert.equal("password" in result, false);
  assert.equal(result.username, "db-user");
});

test("CreateDatabaseConnectionUseCase does not save when its user does not exist", async () => {
  let saved = false;
  const useCase = new CreateDatabaseConnectionUseCase(
    {
      save: async () => {
        saved = true;
      },
      findById: async () => null,
      findManyByUserId: async () => [],
      findAll: async () => [],
      update: async () => undefined,
      delete: async () => undefined,
    },
    {
      findById: async () => null,
      findByEmail: async () => null,
      save: async () => undefined,
    },
  );
  await assert.rejects(() => useCase.execute(request), UserNotFoundError);
  assert.equal(saved, false);
});

test("Update, get and delete enforce ownership without revealing another user's connection", async () => {
  const connection = makeConnection(other);
  let updates = 0;
  let deletes = 0;
  const repo = {
    save: async () => undefined,
    findById: async () => connection,
    findManyByUserId: async () => [],
    findAll: async () => [],
    update: async () => {
      updates++;
    },
    delete: async () => {
      deletes++;
    },
  };
  const update = new UpdateDatabaseConnectionUseCase(repo);
  const get = new GetDatabaseConnectionByIdUseCase(repo);
  const remove = new DeleteDatabaseConnectionUseCase(repo);
  const updateData = { ...request, id: connection.id, password: undefined };
  await assert.rejects(
    () => update.execute(updateData),
    DatabaseConnectionNotFoundError,
  );
  await assert.rejects(
    () => get.execute({ id: connection.id, userId: owner }),
    DatabaseConnectionNotFoundError,
  );
  await assert.rejects(
    () => remove.execute({ id: connection.id, userId: owner }),
    DatabaseConnectionNotFoundError,
  );
  assert.equal(updates, 0);
  assert.equal(deletes, 0);
});

test("Update preserves password when it is omitted, while get and list omit passwords", async () => {
  const connection = makeConnection();
  let updated: DatabaseConnection | undefined;
  let queriedUserId = "";
  const repo = {
    save: async () => undefined,
    findById: async () => connection,
    findManyByUserId: async (id: string) => {
      queriedUserId = id;
      return [connection];
    },
    findAll: async () => [],
    update: async (value: DatabaseConnection) => {
      updated = value;
    },
    delete: async () => undefined,
  };
  const update = new UpdateDatabaseConnectionUseCase(repo);
  await update.execute({
    ...request,
    id: connection.id,
    name: "Updated",
    password: undefined,
  });
  assert.equal(updated?.name, "Updated");
  assert.equal(updated?.password, "secret");
  const get = await new GetDatabaseConnectionByIdUseCase(repo).execute({
    id: connection.id,
    userId: owner,
  });
  const list = await new ListDatabaseConnectionsUseCase(repo).execute({
    userId: owner,
  });
  assert.equal("password" in get, false);
  assert.equal("password" in list[0], false);
  assert.equal(queriedUserId, owner);
});

test("TestDatabaseConnectionUseCase selects the provider tester only after ownership succeeds", async () => {
  const connection = makeConnection();
  let provider: DatabaseProvider | undefined;
  let tested: DatabaseConnection | undefined;
  const repo = {
    save: async () => undefined,
    findById: async () => connection,
    findManyByUserId: async () => [],
    findAll: async () => [],
    update: async () => undefined,
    delete: async () => undefined,
  };
  const tester = {
    test: async (value: DatabaseConnection) => {
      tested = value;
      return { success: true, message: "ok" };
    },
  };
  const useCase = new TestDatabaseConnectionUseCase(repo, {
    get: (value) => {
      provider = value;
      return tester;
    },
  });
  assert.deepEqual(
    await useCase.execute({ connectionId: connection.id, userId: owner }),
    { success: true, message: "ok" },
  );
  assert.equal(provider, DatabaseProvider.POSTGRESQL);
  assert.equal(tested, connection);
  const forbidden = new TestDatabaseConnectionUseCase(
    { ...repo, findById: async () => makeConnection(other) },
    {
      get: () => {
        throw new Error("must not get tester");
      },
    },
  );
  await assert.rejects(
    () => forbidden.execute({ connectionId: connection.id, userId: owner }),
    DatabaseConnectionNotFoundError,
  );
});

test("connection use cases reject missing resources and deletion calls the repository once", async () => {
  let deletes = 0;
  const owned = makeConnection();
  const ownedRepo = {
    save: async () => undefined,
    findById: async () => owned,
    findManyByUserId: async () => [],
    findAll: async () => [],
    update: async () => undefined,
    delete: async (id: string) => {
      assert.equal(id, owned.id);
      deletes++;
    },
  };
  await new DeleteDatabaseConnectionUseCase(ownedRepo).execute({
    id: owned.id,
    userId: owner,
  });
  assert.equal(deletes, 1);
  const missing = { ...ownedRepo, findById: async () => null };
  for (const operation of [
    () =>
      new UpdateDatabaseConnectionUseCase(missing).execute({
        ...request,
        id: owned.id,
      }),
    () =>
      new GetDatabaseConnectionByIdUseCase(missing).execute({
        id: owned.id,
        userId: owner,
      }),
    () =>
      new DeleteDatabaseConnectionUseCase(missing).execute({
        id: owned.id,
        userId: owner,
      }),
    () =>
      new TestDatabaseConnectionUseCase(missing, {
        get: () => {
          throw new Error("tester must not be requested");
        },
      }).execute({ connectionId: owned.id, userId: owner }),
  ])
    await assert.rejects(operation, DatabaseConnectionNotFoundError);
});

test("connection creation validation, empty list, and tester failures remain observable", async () => {
  let saves = 0;
  let userQueries = 0;
  const repo = {
    save: async () => {
      saves++;
    },
    findById: async () => makeConnection(),
    findManyByUserId: async (id: string) => {
      userQueries++;
      assert.equal(id, owner);
      return [];
    },
    findAll: async () => [],
    update: async () => undefined,
    delete: async () => undefined,
  };
  const create = new CreateDatabaseConnectionUseCase(repo, {
    findById: async () => ({}) as never,
    findByEmail: async () => null,
    save: async () => undefined,
  });
  await assert.rejects(() => create.execute({ ...request, port: 0 }));
  assert.equal(saves, 0);
  assert.deepEqual(
    await new ListDatabaseConnectionsUseCase(repo).execute({ userId: owner }),
    [],
  );
  assert.equal(userQueries, 1);
  const failing = new TestDatabaseConnectionUseCase(repo, {
    get: () => ({
      test: async () => {
        throw new Error("connection refused");
      },
    }),
  });
  await assert.rejects(
    () => failing.execute({ connectionId: makeConnection().id, userId: owner }),
    /connection refused/,
  );
});
