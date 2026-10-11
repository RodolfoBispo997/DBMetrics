import assert from "node:assert/strict";
import test from "node:test";
import { AlertProcessorService } from "../src/alerts/application/services/alert-processor.service";
import { AlertEvaluatorService } from "../src/alerts/application/services/alert-evaluator.service";
import { CreateAlertExecutionUseCase } from "../src/alerts/application/use-cases/create-alert-execution/create-alert-execution.use-case";
import { AlertExecution } from "../src/alerts/domain/entities/alert-execution";
import { AlertOutboxEvent } from "../src/alerts/domain/entities/alert-outbox-event";
import { AlertRule } from "../src/alerts/domain/entities/alert-rule";
import { AlertMetric } from "../src/alerts/domain/enums/alert-metric.enum";
import { AlertOperator } from "../src/alerts/domain/enums/alert-operator.enum";
import { NotificationChannel } from "../src/alerts/domain/enums/notification-channel.enum";
import { DatabaseConnection } from "../src/database-connection/domain/entities/database-connection";
import { DatabaseProvider } from "../src/database-connection/domain/enums/database-provider.enum";
import { DatabaseMetrics } from "../src/database-metric/domain/entities/database-metric";
import { PrismaAlertExecutionRepository } from "../src/alerts/infra/repositories/prisma-alert-execution.repository";

const connectionId = "550e8400-e29b-41d4-a716-446655440000";
const userId = "550e8400-e29b-41d4-a716-446655440001";
const rule = AlertRule.create({
  metric: AlertMetric.DATABASE_SIZE,
  operator: AlertOperator.GREATER_THAN,
  threshold: 0,
  channel: NotificationChannel.WHATSAPP,
  destination: "5511999999999",
  cooldownMinutes: 30,
  databaseConnectionId: connectionId,
});
const connection = DatabaseConnection.restore({
  id: connectionId,
  name: "PostgreSQL",
  provider: DatabaseProvider.POSTGRESQL,
  host: "localhost",
  port: 5432,
  database: "metrics",
  username: "postgres",
  password: "unused",
  userId,
});
const metric = () => DatabaseMetrics.create({
  databaseConnectionId: connectionId,
  databaseVersion: "PostgreSQL 16",
  tablesCount: 1,
  viewsCount: 0,
  schemasCount: 1,
  indexesCount: 0,
  functionsCount: 0,
  databaseSize: 1,
  activeConnections: 1,
});

test("repeated triggered collections do not create another execution while delivery is pending", async () => {
  const previousMode = process.env.ALERT_ASYNC_DELIVERY_ENABLED;
  process.env.ALERT_ASYNC_DELIVERY_ENABLED = "true";
  const pendingByRule = new Set<string>();
  const executions: AlertExecution[] = [];
  let outboxCount = 0;
  let sends = 0;
  const repository = {
    saveIfNotificationEligible: async (execution: AlertExecution, outbox?: { alertExecutionId: string }) => {
      if (pendingByRule.has(execution.alertRuleId)) return false;
      pendingByRule.add(execution.alertRuleId);
      executions.push(execution);
      if (outbox) outboxCount++;
      return true;
    },
  };
  const createExecution = new CreateAlertExecutionUseCase(repository as never, new AlertEvaluatorService());
  const processor = new AlertProcessorService(
    { findManyByConnectionId: async () => [rule], update: async () => undefined } as never,
    {} as never,
    { findById: async () => connection } as never,
    new AlertEvaluatorService(),
    createExecution,
    { get: () => ({ send: async () => { sends++; } }) } as never,
  );

  try {
    await processor.process(metric());
    await processor.process(metric());
    await processor.process(metric());
  } finally {
    if (previousMode === undefined) delete process.env.ALERT_ASYNC_DELIVERY_ENABLED;
    else process.env.ALERT_ASYNC_DELIVERY_ENABLED = previousMode;
  }

  assert.equal(executions.length, 1);
  assert.equal(outboxCount, 1);
  assert.equal(executions[0]?.status, "PENDING");
  assert.equal(sends, 0);
});

test("cooldown suppresses another execution after a successful notification", async () => {
  const cooldownRule = AlertRule.restore({
    id: rule.id,
    metric: rule.metric,
    operator: rule.operator,
    threshold: rule.threshold,
    channel: rule.channel,
    destination: rule.destination,
    enabled: true,
    cooldownMinutes: 30,
    currentState: "TRIGGERED" as never,
    lastNotificationAt: new Date(),
    databaseConnectionId: connectionId,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  });
  let creates = 0;
  const processor = new AlertProcessorService(
    { findManyByConnectionId: async () => [cooldownRule], update: async () => undefined } as never,
    {} as never,
    { findById: async () => connection } as never,
    new AlertEvaluatorService(),
    { execute: async () => { creates++; return null; } } as never,
    { get: () => ({ send: async () => undefined }) } as never,
  );

  await processor.process(metric());

  assert.equal(creates, 0);
});
test("repository atomically suppresses a second PENDING execution for the rule", async () => {
  let executionCreates = 0;
  let pending = false;
  const tx = {
    $queryRaw: async () => [{ lastNotificationAt: null, cooldownMinutes: 30 }],
    alertExecution: {
      findFirst: async () => pending ? { id: "existing-pending" } : null,
      create: async () => { executionCreates++; pending = true; },
    },
    alertOutboxEvent: { create: async () => undefined },
  };
  const prisma = {
    $transaction: async (callback: (transaction: typeof tx) => Promise<boolean>) => callback(tx),
  };
  const repository = new PrismaAlertExecutionRepository(prisma as never);
  const execution = { alertRuleId: rule.id } as AlertExecution;

  assert.equal(await repository.saveIfNotificationEligible(execution), true);
  assert.equal(await repository.saveIfNotificationEligible(execution), false);
  assert.equal(executionCreates, 1);
});
test("new outbox availability uses the database clock instead of a skewed app timestamp", async () => {
  let createdOutboxData: Record<string, unknown> | undefined;
  const tx = {
    $queryRaw: async () => [{ lastNotificationAt: null, cooldownMinutes: 30 }],
    alertExecution: { findFirst: async () => null, create: async () => undefined },
    alertOutboxEvent: { create: async ({ data }: { data: Record<string, unknown> }) => { createdOutboxData = data; } },
  };
  const prisma = { $transaction: async (callback: (transaction: typeof tx) => Promise<boolean>) => callback(tx) };
  const repository = new PrismaAlertExecutionRepository(prisma as never);
  const execution = { id: "execution-id", alertRuleId: rule.id } as AlertExecution;
  const appClockFuture = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const outbox = AlertOutboxEvent.create(
    { alertExecutionId: execution.id, channel: "EMAIL", destination: "masked@example.com", executedAt: appClockFuture.toISOString() },
    execution.id,
    execution.id,
    appClockFuture,
  );

  assert.equal(outbox.availableAt.getTime(), appClockFuture.getTime());
  assert.equal(await repository.saveIfNotificationEligible(execution, outbox), true);
  assert.ok(createdOutboxData);
  assert.equal(Object.hasOwn(createdOutboxData, "availableAt"), false);
});