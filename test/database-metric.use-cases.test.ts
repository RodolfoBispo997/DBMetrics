import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseConnection } from "../src/database-connection/domain/entities/database-connection";
import { DatabaseProvider } from "../src/database-connection/domain/enums/database-provider.enum";
import { DatabaseConnectionNotFoundError } from "../src/database-connection/domain/errors/database-connection-not-found-error";
import { DatabaseMetrics } from "../src/database-metric/domain/entities/database-metric";
import { RecordDatabaseMetricUseCase } from "../src/database-metric/application/use-cases/record-database-metric/record-database-metric.use-case";
import { CollectDatabaseMetricUseCase } from "../src/database-metric/application/use-cases/collect-database-metric/collect-database-metric.use-case";
import { CollectDatabaseMetricsUseCase } from "../src/database-metric/application/use-cases/collect-database-metrics/collect-database-metrics.use-case";
import { GetDatabaseMetricUseCase } from "../src/database-metric/application/use-cases/get-database-metric/get-database-metric.use-case";

const owner = "00000000-0000-4000-8000-000000000001";
const makeConnection = (
  id = "00000000-0000-4000-8000-000000000003",
  userId = owner,
) =>
  DatabaseConnection.restore({
    id,
    name: "Primary",
    provider: DatabaseProvider.POSTGRESQL,
    host: "localhost",
    port: 5432,
    database: "metrics",
    username: "db-user",
    password: "secret",
    userId,
  });
const makeMetric = (
  connectionId = "00000000-0000-4000-8000-000000000003",
  createdAt = new Date("2026-01-02T00:00:00.000Z"),
) =>
  DatabaseMetrics.restore({
    id: "00000000-0000-4000-8000-000000000004",
    databaseConnectionId: connectionId,
    databaseVersion: "PostgreSQL 16",
    tablesCount: 1,
    viewsCount: 2,
    schemasCount: 3,
    indexesCount: 4,
    functionsCount: 5,
    databaseSize: 6,
    activeConnections: 7,
    createdAt,
  });
const repository = (connections: DatabaseConnection[] = []) => ({
  save: async () => undefined,
  findById: async (id: string) =>
    connections.find((connection) => connection.id === id) ?? null,
  findManyByUserId: async () => [],
  findAll: async () => connections,
  update: async () => undefined,
  delete: async () => undefined,
});

test("RecordDatabaseMetricUseCase collects, persists, then processes the persisted metric", async () => {
  const events: string[] = [];
  const connection = makeConnection();
  let provider: DatabaseProvider | undefined;
  let processed: DatabaseMetrics | undefined;
  const useCase = new RecordDatabaseMetricUseCase(
    {
      save: async () => {
        events.push("save");
      },
      findByConnectionId: async () => [],
      findHistoryByConnectionId: async () => [],
      findHistoryCountByConnectionId: async () => 0,
      findLatestByConnectionIds: async () => new Map(),
      findLatestByConnectionId: async () => null,
    },
    {
      get: (value) => {
        provider = value;
        return {
          collect: async (received: DatabaseConnection) => {
            assert.equal(received, connection);
            return {
              databaseVersion: "PostgreSQL 16",
              tablesCount: 1,
              viewsCount: 2,
              schemasCount: 3,
              indexesCount: 4,
              functionsCount: 5,
              databaseSize: 6,
              activeConnections: 7,
            };
          },
        };
      },
    },
    {
      process: async (metric: DatabaseMetrics) => {
        events.push("process");
        processed = metric;
      },
    } as never,
  );
  const metric = await useCase.execute(connection);
  assert.equal(provider, DatabaseProvider.POSTGRESQL);
  assert.deepEqual(events, ["save", "process"]);
  assert.equal(processed, metric);
  assert.equal(metric.databaseVersion, "PostgreSQL 16");
});

test("RecordDatabaseMetricUseCase does not process alerts after collection or persistence failures", async () => {
  const connection = makeConnection();
  let processed = false;
  for (const failure of ["collect", "save"] as const) {
    const useCase = new RecordDatabaseMetricUseCase(
      {
        save: async () => {
          if (failure === "save") throw new Error("save failed");
        },
        findByConnectionId: async () => [],
        findHistoryByConnectionId: async () => [],
        findHistoryCountByConnectionId: async () => 0,
        findLatestByConnectionIds: async () => new Map(),
        findLatestByConnectionId: async () => null,
      },
      {
        get: () => ({
          collect: async () => {
            if (failure === "collect") throw new Error("collect failed");
            return {
              databaseVersion: "v",
              tablesCount: 0,
              viewsCount: 0,
              schemasCount: 0,
              indexesCount: 0,
              functionsCount: 0,
              databaseSize: 0,
              activeConnections: 0,
            };
          },
        }),
      },
      {
        process: async () => {
          processed = true;
        },
      } as never,
    );
    await assert.rejects(() => useCase.execute(connection));
  }
  assert.equal(processed, false);
});

test("CollectDatabaseMetricUseCase delegates only an owned connection", async () => {
  const connection = makeConnection();
  let received: DatabaseConnection | undefined;
  const useCase = new CollectDatabaseMetricUseCase(repository([connection]), {
    execute: async (value: DatabaseConnection) => {
      received = value;
    },
  } as never);
  await useCase.execute({ connectionId: connection.id, userId: owner });
  assert.equal(received, connection);
  const denied = new CollectDatabaseMetricUseCase(
    repository([
      makeConnection(connection.id, "00000000-0000-4000-8000-000000000002"),
    ]),
    {
      execute: async () => {
        throw new Error("must not run");
      },
    } as never,
  );
  await assert.rejects(
    () => denied.execute({ connectionId: connection.id, userId: owner }),
    DatabaseConnectionNotFoundError,
  );
});

test("CollectDatabaseMetricsUseCase continues sequentially and returns batch totals", async () => {
  const first = makeConnection();
  const second = makeConnection("00000000-0000-4000-8000-000000000005");
  const calls: string[] = [];
  const useCase = new CollectDatabaseMetricsUseCase(
    repository([first, second]),
    {
      execute: async (connection: DatabaseConnection) => {
        calls.push(connection.id);
        if (connection === first) throw new Error("unavailable");
      },
    } as never,
  );
  assert.deepEqual(await useCase.execute(), {
    processed: 2,
    success: 1,
    failed: 1,
  });
  assert.deepEqual(calls, [first.id, second.id]);
  const empty = new CollectDatabaseMetricsUseCase(repository(), {
    execute: async () => undefined,
  } as never);
  assert.deepEqual(await empty.execute(), {
    processed: 0,
    success: 0,
    failed: 0,
  });
});

test("GetDatabaseMetricUseCase maps repository history and blocks unauthorized queries", async () => {
  const connection = makeConnection();
  const metric = makeMetric();
  let queried = false;
  const metricRepository = {
    save: async () => undefined,
    findByConnectionId: async () => {
      queried = true;
      return [metric];
    },
    findHistoryByConnectionId: async () => [],
    findHistoryCountByConnectionId: async () => 0,
    findLatestByConnectionIds: async () => new Map(),
    findLatestByConnectionId: async () => null,
  };
  const useCase = new GetDatabaseMetricUseCase(
    metricRepository,
    repository([connection]),
  );
  const result = await useCase.execute({
    connectionId: connection.id,
    userId: owner,
  });
  assert.equal(result[0].createdAt, metric.createdAt);
  assert.equal(result[0].databaseSize, 6);
  queried = false;
  const denied = new GetDatabaseMetricUseCase(
    metricRepository,
    repository([
      makeConnection(connection.id, "00000000-0000-4000-8000-000000000002"),
    ]),
  );
  await assert.rejects(
    () => denied.execute({ connectionId: connection.id, userId: owner }),
    DatabaseConnectionNotFoundError,
  );
  assert.equal(queried, false);
});

test("metrics reject invalid collector data without saving or alert processing", async () => {
  let saves = 0;
  let processed = 0;
  const useCase = new RecordDatabaseMetricUseCase(
    {
      save: async () => {
        saves++;
      },
      findByConnectionId: async () => [],
      findHistoryByConnectionId: async () => [],
      findHistoryCountByConnectionId: async () => 0,
      findLatestByConnectionIds: async () => new Map(),
      findLatestByConnectionId: async () => null,
    },
    {
      get: () => ({
        collect: async () => ({
          databaseVersion: "v",
          tablesCount: -1,
          viewsCount: 0,
          schemasCount: 0,
          indexesCount: 0,
          functionsCount: 0,
          databaseSize: 0,
          activeConnections: 0,
        }),
      }),
    },
    {
      process: async () => {
        processed++;
      },
    } as never,
  );
  await assert.rejects(() => useCase.execute(makeConnection()));
  assert.equal(saves, 0);
  assert.equal(processed, 0);
  let recorded = 0;
  await assert.rejects(
    () =>
      new CollectDatabaseMetricUseCase(repository(), {
        execute: async () => {
          recorded++;
        },
      } as never).execute({ connectionId: makeConnection().id, userId: owner }),
    DatabaseConnectionNotFoundError,
  );
  assert.equal(recorded, 0);
});

test("metric batch succeeds fully and history preserves explicit public fields and repository order", async () => {
  const first = makeConnection();
  const second = makeConnection("00000000-0000-4000-8000-000000000005");
  const batch = new CollectDatabaseMetricsUseCase(repository([first, second]), {
    execute: async () => undefined,
  } as never);
  assert.deepEqual(await batch.execute(), {
    processed: 2,
    success: 2,
    failed: 0,
  });
  const older = makeMetric(first.id, new Date("2026-01-01"));
  const newer = makeMetric(first.id, new Date("2026-01-02"));
  const metrics = {
    save: async () => undefined,
    findByConnectionId: async () => [newer, older],
    findHistoryByConnectionId: async () => [],
    findHistoryCountByConnectionId: async () => 0,
    findLatestByConnectionIds: async () => new Map(),
    findLatestByConnectionId: async () => null,
  };
  const result = await new GetDatabaseMetricUseCase(
    metrics,
    repository([first]),
  ).execute({ connectionId: first.id, userId: owner });
  assert.deepEqual(
    result.map(
      ({
        id,
        databaseVersion,
        tablesCount,
        viewsCount,
        schemasCount,
        indexesCount,
        functionsCount,
        databaseSize,
        activeConnections,
      }) => ({
        id,
        databaseVersion,
        tablesCount,
        viewsCount,
        schemasCount,
        indexesCount,
        functionsCount,
        databaseSize,
        activeConnections,
      }),
    ),
    [newer, older].map(
      ({
        id,
        databaseVersion,
        tablesCount,
        viewsCount,
        schemasCount,
        indexesCount,
        functionsCount,
        databaseSize,
        activeConnections,
      }) => ({
        id,
        databaseVersion,
        tablesCount,
        viewsCount,
        schemasCount,
        indexesCount,
        functionsCount,
        databaseSize,
        activeConnections,
      }),
    ),
  );
  assert.deepEqual(
    await new GetDatabaseMetricUseCase(
      { ...metrics, findByConnectionId: async () => [] },
      repository([first]),
    ).execute({ connectionId: first.id, userId: owner }),
    [],
  );
});
