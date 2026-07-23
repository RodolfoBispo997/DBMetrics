import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseConnection } from "../src/database-connection/domain/entities/database-connection";
import { DatabaseProvider } from "../src/database-connection/domain/enums/database-provider.enum";
import { DatabaseConnectionNotFoundError } from "../src/database-connection/domain/errors/database-connection-not-found-error";
import { DatabaseMetrics } from "../src/database-metric/domain/entities/database-metric";
import { GetDashboardOverviewUseCase } from "../src/dashboard/application/use-cases/get-dashboard-overview/get-dashboard-overview.use-case";
import { GetDashboardConnectionMetricsSummaryUseCase } from "../src/dashboard/application/use-cases/get-dashboard-connection-metrics-summary/get-dashboard-connection-metrics-summary.use-case";
import { GetDashboardConnectionMetricsHistoryUseCase } from "../src/dashboard/application/use-cases/get-dashboard-connection-metrics-history/get-dashboard-connection-metrics-history.use-case";
import { GetDashboardConnectionMetricsChartUseCase } from "../src/dashboard/application/use-cases/get-dashboard-connection-metrics-chart/get-dashboard-connection-metrics-chart.use-case";
import { resolveDashboardDateRange } from "../src/dashboard/application/utils/resolve-dashboard-date-range";
import { InvalidDashboardDateRangeError } from "../src/dashboard/application/errors/invalid-dashboard-date-range-error";
import { InvalidDashboardHistoryLimitError } from "../src/dashboard/application/errors/invalid-dashboard-history-limit-error";
import { InvalidDashboardHistoryPageError } from "../src/dashboard/application/errors/invalid-dashboard-history-page-error";

const owner = "00000000-0000-4000-8000-000000000001";
const connection = DatabaseConnection.restore({
  id: "00000000-0000-4000-8000-000000000003",
  name: "Primary",
  provider: DatabaseProvider.POSTGRESQL,
  host: "localhost",
  port: 5432,
  database: "metrics",
  username: "user",
  password: "secret",
  userId: owner,
});
const metric = (size: number, createdAt: Date) =>
  DatabaseMetrics.restore({
    id: "00000000-0000-4000-8000-000000000004",
    databaseConnectionId: connection.id,
    databaseVersion: "v",
    tablesCount: size,
    viewsCount: size,
    schemasCount: size,
    indexesCount: size,
    functionsCount: size,
    databaseSize: size,
    activeConnections: size,
    createdAt,
  });
const connectionRepo = (value: DatabaseConnection | null = connection) => ({
  save: async () => undefined,
  findById: async () => value,
  findManyByUserId: async () => (value ? [value] : []),
  findAll: async () => [],
  update: async () => undefined,
  delete: async () => undefined,
});

test("Dashboard overview queries only the user connections, aggregates latest metrics, and hides OFFLINE health", async () => {
  const latest = metric(5, new Date("2026-01-02T00:00:00Z"));
  let ids: string[] = [];
  const useCase = new GetDashboardOverviewUseCase(
    connectionRepo(),
    {
      save: async () => undefined,
      findByConnectionId: async () => [],
      findHistoryByConnectionId: async () => [],
      findHistoryCountByConnectionId: async () => 0,
      findLatestByConnectionIds: async (value) => {
        ids = value;
        return new Map([[connection.id, latest]]);
      },
      findLatestByConnectionId: async () => null,
    },
    {
      evaluate: () => ({
        status: "OFFLINE",
        message: "down",
        checkedAt: new Date(),
      }),
    },
  );
  const result = await useCase.execute({ userId: owner });
  assert.deepEqual(ids, [connection.id]);
  assert.equal(result.summary.totalDatabaseSize, 5);
  assert.equal(result.summary.totalConnections, 1);
  assert.equal(result.connections[0].health, null);
  assert.equal(result.connections[0].lastMetric?.tablesCount, 5);
});

test("Dashboard summary uses the 24-hour history window and computes growth", async () => {
  let query: { startDate: Date; endDate: Date } | undefined;
  const useCase = new GetDashboardConnectionMetricsSummaryUseCase(
    connectionRepo(),
    {
      save: async () => undefined,
      findByConnectionId: async () => [],
      findHistoryByConnectionId: async (data) => {
        query = data;
        return [
          metric(10, new Date("2026-01-02")),
          metric(4, new Date("2026-01-01")),
        ];
      },
      findHistoryCountByConnectionId: async () => 0,
      findLatestByConnectionIds: async () => new Map(),
      findLatestByConnectionId: async () => null,
    },
  );
  const result = await useCase.execute({
    connectionId: connection.id,
    userId: owner,
  });
  assert.equal(result.current?.databaseSize, 10);
  assert.equal(result.growth?.databaseSize, 6);
  assert.ok(
    query && query.endDate.getTime() - query.startDate.getTime() >= 86_399_000,
  );
});

test("Dashboard history validates pagination, maps snapshots, and does not query metrics before ownership", async () => {
  let historyQuery: { skip?: number; limit?: number } | undefined;
  const metrics = {
    save: async () => undefined,
    findByConnectionId: async () => [],
    findHistoryByConnectionId: async (data) => {
      historyQuery = data;
      return [metric(3, new Date("2026-01-01"))];
    },
    findHistoryCountByConnectionId: async () => 3,
    findLatestByConnectionIds: async () => new Map(),
    findLatestByConnectionId: async () => null,
  };
  const useCase = new GetDashboardConnectionMetricsHistoryUseCase(
    connectionRepo(),
    metrics,
  );
  const result = await useCase.execute({
    connectionId: connection.id,
    userId: owner,
    page: "2",
    limit: "2",
    startDate: "2026-01-01",
    endDate: "2026-01-02",
  });
  assert.equal(historyQuery?.skip, 2);
  assert.equal(historyQuery?.limit, 2);
  assert.equal(result.pagination.totalPages, 2);
  assert.equal(
    result.history[0].collectedAt.toISOString(),
    "2026-01-01T00:00:00.000Z",
  );
  await assert.rejects(
    () =>
      useCase.execute({
        connectionId: connection.id,
        userId: owner,
        limit: "1.5",
      }),
    InvalidDashboardHistoryLimitError,
  );
  const denied = new GetDashboardConnectionMetricsHistoryUseCase(
    connectionRepo(null),
    {
      ...metrics,
      findHistoryByConnectionId: async () => {
        throw new Error("must not query");
      },
    },
  );
  await assert.rejects(
    () => denied.execute({ connectionId: connection.id, userId: owner }),
    DatabaseConnectionNotFoundError,
  );
});

test("Dashboard chart asks for descending history then returns chronologically ordered points", async () => {
  let order = "";
  const useCase = new GetDashboardConnectionMetricsChartUseCase(
    connectionRepo(),
    {
      save: async () => undefined,
      findByConnectionId: async () => [],
      findHistoryByConnectionId: async (data) => {
        order = data.order ?? "";
        return [
          metric(2, new Date("2026-01-02")),
          metric(1, new Date("2026-01-01")),
        ];
      },
      findHistoryCountByConnectionId: async () => 0,
      findLatestByConnectionIds: async () => new Map(),
      findLatestByConnectionId: async () => null,
    },
  );
  const result = await useCase.execute({
    connectionId: connection.id,
    userId: owner,
    startDate: "2026-01-01",
    endDate: "2026-01-02",
  });
  assert.equal(order, "desc");
  assert.deepEqual(
    result.series.databaseSize.map((point) => point.value),
    [1, 2],
  );
});

test("resolveDashboardDateRange implements its documented defaults and rejects invalid ranges", () => {
  const now = new Date("2026-01-08T12:00:00Z");
  assert.deepEqual(resolveDashboardDateRange({ now }), {
    startDate: new Date("2026-01-01T12:00:00Z"),
    endDate: now,
  });
  assert.deepEqual(
    resolveDashboardDateRange({ endDate: "2026-01-05T00:00:00Z", now })
      .startDate,
    new Date("2025-12-29T00:00:00Z"),
  );
  assert.throws(
    () =>
      resolveDashboardDateRange({
        startDate: "2026-01-03",
        endDate: "2026-01-02",
        now,
      }),
    InvalidDashboardDateRangeError,
  );
  assert.throws(
    () => resolveDashboardDateRange({ startDate: "invalid", now }),
    InvalidDashboardDateRangeError,
  );
});

test("Dashboard overview handles empty and metricless connections and exposes non-offline health", async () => {
  let ids: string[] | undefined;
  const metrics = {
    save: async () => undefined,
    findByConnectionId: async () => [],
    findHistoryByConnectionId: async () => [],
    findHistoryCountByConnectionId: async () => 0,
    findLatestByConnectionIds: async (value: string[]) => {
      ids = value;
      return new Map();
    },
    findLatestByConnectionId: async () => null,
  };
  const empty = new GetDashboardOverviewUseCase(connectionRepo(null), metrics, {
    evaluate: () => ({
      status: "HEALTHY",
      message: "ok",
      checkedAt: new Date(),
    }),
  });
  assert.deepEqual(await empty.execute({ userId: owner }), {
    summary: {
      totalConnections: 0,
      totalDatabaseSize: 0,
      totalActiveConnections: 0,
      totalTables: 0,
      totalViews: 0,
      totalSchemas: 0,
      totalIndexes: 0,
      totalFunctions: 0,
    },
    connections: [],
  });
  assert.deepEqual(ids, []);
  const withoutMetric = await new GetDashboardOverviewUseCase(
    connectionRepo(),
    metrics,
    {
      evaluate: () => ({
        status: "HEALTHY",
        message: "ok",
        checkedAt: new Date(),
      }),
    },
  ).execute({ userId: owner });
  assert.equal(withoutMetric.connections[0].lastMetric, null);
  assert.equal(withoutMetric.connections[0].health, null);
  const latest = metric(2, new Date("2026-01-01"));
  const healthy = await new GetDashboardOverviewUseCase(
    connectionRepo(),
    {
      ...metrics,
      findLatestByConnectionIds: async () => new Map([[connection.id, latest]]),
    },
    {
      evaluate: () => ({
        status: "HEALTHY",
        message: "ok",
        checkedAt: new Date(),
      }),
    },
  ).execute({ userId: owner });
  assert.deepEqual(healthy.connections[0].health, {
    status: "HEALTHY",
    message: "ok",
    checkedAt: latest.createdAt,
  });
});

test("Dashboard summary empty, single history, history defaults and chart failures follow contracts", async () => {
  let queried = 0;
  const metrics = {
    save: async () => undefined,
    findByConnectionId: async () => [],
    findHistoryByConnectionId: async () => {
      queried++;
      return [];
    },
    findHistoryCountByConnectionId: async () => 0,
    findLatestByConnectionIds: async () => new Map(),
    findLatestByConnectionId: async () => null,
  };
  assert.deepEqual(
    await new GetDashboardConnectionMetricsSummaryUseCase(
      connectionRepo(),
      metrics,
    ).execute({ connectionId: connection.id, userId: owner }),
    { connectionId: connection.id, current: null, growth: null },
  );
  const single = metric(8, new Date("2026-01-02"));
  const singleSummary = await new GetDashboardConnectionMetricsSummaryUseCase(
    connectionRepo(),
    { ...metrics, findHistoryByConnectionId: async () => [single] },
  ).execute({ connectionId: connection.id, userId: owner });
  assert.equal(singleSummary.current?.databaseSize, 8);
  assert.deepEqual(singleSummary.growth, {
    databaseSize: 0,
    tablesCount: 0,
    viewsCount: 0,
    schemasCount: 0,
    indexesCount: 0,
    functionsCount: 0,
    activeConnections: 0,
  });
  await assert.rejects(
    () =>
      new GetDashboardConnectionMetricsSummaryUseCase(
        connectionRepo(null),
        metrics,
      ).execute({ connectionId: connection.id, userId: owner }),
    DatabaseConnectionNotFoundError,
  );
  assert.equal(queried, 1);
  let historyData: { limit?: number; skip?: number } | undefined;
  const historyMetrics = {
    ...metrics,
    findHistoryByConnectionId: async (data: {
      limit?: number;
      skip?: number;
    }) => {
      historyData = data;
      return [];
    },
  };
  const history = new GetDashboardConnectionMetricsHistoryUseCase(
    connectionRepo(),
    historyMetrics,
  );
  const result = await history.execute({
    connectionId: connection.id,
    userId: owner,
  });
  assert.equal(historyData?.limit, 20);
  assert.equal(historyData?.skip, 0);
  assert.equal(result.pagination.totalPages, 0);
  for (const page of ["0", "1.5", "nan"])
    await assert.rejects(
      () =>
        history.execute({ connectionId: connection.id, userId: owner, page }),
      InvalidDashboardHistoryPageError,
    );
  for (const limit of ["0", "101", "nan"])
    await assert.rejects(
      () =>
        history.execute({ connectionId: connection.id, userId: owner, limit }),
      InvalidDashboardHistoryLimitError,
    );
  let chartQueries = 0;
  const chart = new GetDashboardConnectionMetricsChartUseCase(
    connectionRepo(),
    {
      ...metrics,
      findHistoryByConnectionId: async () => {
        chartQueries++;
        return [];
      },
    },
  );
  assert.deepEqual(
    (
      await chart.execute({
        connectionId: connection.id,
        userId: owner,
        startDate: "2026-01-01",
        endDate: "2026-01-02",
      })
    ).series.databaseSize,
    [],
  );
  await assert.rejects(
    () =>
      chart.execute({
        connectionId: connection.id,
        userId: owner,
        startDate: "2026-01-03",
        endDate: "2026-01-02",
      }),
    InvalidDashboardDateRangeError,
  );
  await assert.rejects(
    () =>
      new GetDashboardConnectionMetricsChartUseCase(connectionRepo(null), {
        ...metrics,
        findHistoryByConnectionId: async () => {
          throw new Error("must not query");
        },
      }).execute({ connectionId: connection.id, userId: owner }),
    DatabaseConnectionNotFoundError,
  );
  assert.equal(chartQueries, 1);
  const now = new Date("2026-01-08T00:00:00Z");
  assert.deepEqual(
    resolveDashboardDateRange({ startDate: "2026-01-02T00:00:00Z", now }),
    { startDate: new Date("2026-01-02T00:00:00Z"), endDate: now },
  );
  assert.deepEqual(
    resolveDashboardDateRange({
      startDate: "2026-01-02T00:00:00Z",
      endDate: "2026-01-03T00:00:00Z",
      now,
    }),
    {
      startDate: new Date("2026-01-02T00:00:00Z"),
      endDate: new Date("2026-01-03T00:00:00Z"),
    },
  );
});
