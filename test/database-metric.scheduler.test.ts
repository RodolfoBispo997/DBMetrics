import assert from "node:assert/strict";
import test from "node:test";

process.env.JWT_SECRET = "scheduler-test-secret";
process.env.DATABASE_CREDENTIALS_KEY = Buffer.alloc(32, 3).toString("base64");
process.env.DATABASE_METRICS_SCHEDULER_ENABLED = "false";

import type { CollectDatabaseMetricsUseCase } from "../src/database-metric/application/use-cases/collect-database-metrics/collect-database-metrics.use-case";

test("runs the database metrics collection use case successfully", async () => {
  const { DatabaseMetricScheduler } = await import(
    "../src/database-metric/infra/scheduler/database-metric.scheduler"
  );
  let calls = 0;
  const useCase = {
    execute: async () => {
      calls++;
      return { processed: 2, success: 2, failed: 0 };
    },
  } as unknown as CollectDatabaseMetricsUseCase;
  const scheduler = new DatabaseMetricScheduler(useCase);

  await scheduler.handleDatabaseMetricsCollection();

  assert.equal(calls, 1);
});

test("captures a global collection failure without rejecting", async () => {
  const { DatabaseMetricScheduler } = await import(
    "../src/database-metric/infra/scheduler/database-metric.scheduler"
  );
  const useCase = {
    execute: async () => {
      throw new Error("global collection failure");
    },
  } as unknown as CollectDatabaseMetricsUseCase;
  const scheduler = new DatabaseMetricScheduler(useCase);

  await assert.doesNotReject(scheduler.handleDatabaseMetricsCollection());
});

test("logs the successful collection result", async () => {
  const { DatabaseMetricScheduler } = await import(
    "../src/database-metric/infra/scheduler/database-metric.scheduler"
  );
  const useCase = {
    execute: async () => ({ processed: 3, success: 2, failed: 1 }),
  } as unknown as CollectDatabaseMetricsUseCase;
  const scheduler = new DatabaseMetricScheduler(useCase);
  const logger = (
    scheduler as unknown as { logger: { log(message: string): void } }
  ).logger;
  const messages: string[] = [];
  logger.log = (message) => messages.push(message);

  await scheduler.handleDatabaseMetricsCollection();

  assert.match(
    messages.at(-1) ?? "",
    /processed=3 success=2 failed=1 durationMs=\d+/,
  );
});
