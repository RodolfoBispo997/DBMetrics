import assert from "node:assert/strict";
import test from "node:test";

import { AlertProcessorService } from "../src/alerts/application/services/alert-processor.service";
import { AlertEvaluatorService } from "../src/alerts/application/services/alert-evaluator.service";
import { AlertExecution } from "../src/alerts/domain/entities/alert-execution";
import { AlertRule } from "../src/alerts/domain/entities/alert-rule";
import { AlertExecutionStatus } from "../src/alerts/domain/enums/alert-execution-status.enum";
import { AlertMetric } from "../src/alerts/domain/enums/alert-metric.enum";
import { AlertOperator } from "../src/alerts/domain/enums/alert-operator.enum";
import { AlertRuleState } from "../src/alerts/domain/enums/alert-rule-state.enum";
import { NotificationChannel } from "../src/alerts/domain/enums/notification-channel.enum";
import { DatabaseConnection } from "../src/database-connection/domain/entities/database-connection";
import { DatabaseProvider } from "../src/database-connection/domain/enums/database-provider.enum";
import { DatabaseMetrics } from "../src/database-metric/domain/entities/database-metric";

const CONNECTION_ID = "550e8400-e29b-41d4-a716-446655440000";
const USER_ID = "550e8400-e29b-41d4-a716-446655440001";

function createRule(): AlertRule {
  return AlertRule.create({
    metric: AlertMetric.ACTIVE_CONNECTIONS,
    operator: AlertOperator.GREATER_THAN,
    threshold: 10,
    channel: NotificationChannel.WHATSAPP,
    destination: "5511999999999",
    cooldownMinutes: 30,
    databaseConnectionId: CONNECTION_ID,
  });
}

function restoreTriggeredRule(lastNotificationAt?: Date): AlertRule {
  const rule = createRule();
  return AlertRule.restore({
    id: rule.id,
    metric: rule.metric,
    operator: rule.operator,
    threshold: rule.threshold,
    channel: rule.channel,
    destination: rule.destination,
    enabled: true,
    cooldownMinutes: rule.cooldownMinutes,
    currentState: AlertRuleState.TRIGGERED,
    lastNotificationAt,
    databaseConnectionId: CONNECTION_ID,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  });
}

function createConnection(id = CONNECTION_ID): DatabaseConnection {
  return DatabaseConnection.restore({
    id,
    name: "Production database",
    provider: DatabaseProvider.POSTGRESQL,
    host: "localhost",
    port: 5432,
    database: "dbmetrics",
    username: "postgres",
    password: "secret",
    userId: USER_ID,
  });
}

function createMetrics(
  databaseConnectionId = CONNECTION_ID,
  activeConnections = 20,
): DatabaseMetrics {
  return DatabaseMetrics.create({
    databaseConnectionId,
    databaseVersion: "PostgreSQL 16",
    tablesCount: 1,
    viewsCount: 1,
    schemasCount: 1,
    indexesCount: 1,
    functionsCount: 1,
    databaseSize: 1,
    activeConnections,
  });
}

type Scenario = {
  processor: AlertProcessorService;
  ruleUpdates: AlertRule[];
  executions: AlertExecution[];
  executionUpdates: AlertExecution[];
  getRuleUpdateAttempts: () => number;
  getCreateCalls: () => number;
  getSendCalls: () => number;
};

function createScenario(
  rules: AlertRule[],
  send: (execution: AlertExecution) => Promise<void> = async () => undefined,
  connections = new Map([[CONNECTION_ID, createConnection()]]),
  failRuleUpdateAt?: number,
): Scenario {
  const ruleUpdates: AlertRule[] = [];
  const executions: AlertExecution[] = [];
  const executionUpdates: AlertExecution[] = [];
  let createCalls = 0;
  let sendCalls = 0;
  let ruleUpdateAttempts = 0;

  const ruleRepository = {
    findManyByConnectionId: async (connectionId: string) =>
      rules.filter((rule) => rule.databaseConnectionId === connectionId),
    update: async (rule: AlertRule) => {
      ruleUpdateAttempts++;

      if (ruleUpdateAttempts === failRuleUpdateAt) {
        throw new Error("rule update failed");
      }

      ruleUpdates.push(rule);
    },
  };
  const executionRepository = {
    update: async (execution: AlertExecution) => {
      executionUpdates.push(execution);
    },
  };
  const databaseConnectionRepository = {
    findById: async (id: string) => connections.get(id) ?? null,
  };
  const createAlertExecutionUseCase = {
    execute: async (
      rule: AlertRule,
      metrics: DatabaseMetrics,
      connection: DatabaseConnection,
    ) => {
      createCalls++;
      const execution = AlertExecution.create({
        alertRuleId: rule.id,
        databaseMetricId: metrics.id,
        databaseConnectionId: metrics.databaseConnectionId,
        connectionName: connection.name,
        databaseProvider: connection.provider,
        host: connection.host,
        databaseName: connection.database,
        port: connection.port,
        metric: rule.metric,
        operator: rule.operator,
        metricValue: metrics.activeConnections,
        threshold: rule.threshold,
        channel: rule.channel,
        destination: rule.destination,
      });
      executions.push(execution);
      return execution;
    },
  };
  const notificationFactory = {
    get: () => ({
      send: async (execution: AlertExecution) => {
        sendCalls++;
        await send(execution);
      },
    }),
  };

  return {
    processor: new AlertProcessorService(
      ruleRepository as never,
      executionRepository as never,
      databaseConnectionRepository as never,
      new AlertEvaluatorService(),
      createAlertExecutionUseCase as never,
      notificationFactory as never,
    ),
    ruleUpdates,
    executions,
    executionUpdates,
    getRuleUpdateAttempts: () => ruleUpdateAttempts,
    getCreateCalls: () => createCalls,
    getSendCalls: () => sendCalls,
  };
}

test("persists TRIGGERED, sends the first violation and records the successful notification", async () => {
  const rule = createRule();
  const scenario = createScenario([rule]);

  await scenario.processor.process(createMetrics());

  assert.equal(rule.currentState, AlertRuleState.TRIGGERED);
  assert.ok(rule.lastNotificationAt);
  assert.equal(scenario.ruleUpdates.length, 2);
  assert.equal(scenario.getCreateCalls(), 1);
  assert.equal(scenario.getSendCalls(), 1);
  assert.equal(scenario.executions[0].status, AlertExecutionStatus.SENT);
});

test("logs the duplicate-notification risk when the final rule state persistence fails", async () => {
  const rule = createRule();
  const scenario = createScenario(
    [rule],
    async () => undefined,
    new Map([[CONNECTION_ID, createConnection()]]),
    2,
  );
  const logger = (
    scenario.processor as unknown as {
      logger: { error(message: string): void };
    }
  ).logger;
  const errors: string[] = [];
  logger.error = (message) => errors.push(message);

  await assert.doesNotReject(scenario.processor.process(createMetrics()));

  assert.equal(scenario.getRuleUpdateAttempts(), 2);
  assert.equal(scenario.getSendCalls(), 1);
  assert.equal(scenario.executions[0].status, AlertExecutionStatus.SENT);
  assert.ok(
    errors.some(
      (message) =>
        message.includes("execution") &&
        message.includes("lastNotificationAt could not be persisted") &&
        message.includes("duplicate notification may occur"),
    ),
  );
});

test("suppresses a continuous violation while the cooldown is active", async () => {
  const rule = restoreTriggeredRule(new Date());
  const scenario = createScenario([rule]);

  await scenario.processor.process(createMetrics());

  assert.equal(scenario.getCreateCalls(), 0);
  assert.equal(scenario.getSendCalls(), 0);
  assert.equal(scenario.ruleUpdates.length, 0);
});

test("does not persist a NORMAL rule when its threshold is not violated", async () => {
  const rule = createRule();
  const scenario = createScenario([rule]);

  await scenario.processor.process(createMetrics(CONNECTION_ID, 0));

  assert.equal(scenario.getCreateCalls(), 0);
  assert.equal(scenario.getSendCalls(), 0);
  assert.equal(scenario.ruleUpdates.length, 0);
});

test("sends a reminder after cooldown expiration", async () => {
  const rule = restoreTriggeredRule(new Date(Date.now() - 31 * 60 * 1000));
  const scenario = createScenario([rule]);

  await scenario.processor.process(createMetrics());

  assert.equal(scenario.getCreateCalls(), 1);
  assert.equal(scenario.getSendCalls(), 1);
  assert.equal(scenario.ruleUpdates.length, 1);
  assert.equal(scenario.executions[0].status, AlertExecutionStatus.SENT);
});

test("recovers a triggered rule without creating an execution and sends again after recovery", async () => {
  const rule = restoreTriggeredRule(new Date());
  const scenario = createScenario([rule]);

  await scenario.processor.process(createMetrics(CONNECTION_ID, 0));
  assert.equal(rule.currentState, AlertRuleState.NORMAL);
  assert.equal(rule.lastNotificationAt, undefined);
  assert.equal(scenario.getCreateCalls(), 0);

  await scenario.processor.process(createMetrics());
  assert.equal(scenario.getCreateCalls(), 1);
  assert.equal(scenario.getSendCalls(), 1);
});

test("keeps TRIGGERED without cooldown after a failed first notification and retries", async () => {
  const rule = createRule();
  let shouldFail = true;
  const scenario = createScenario([rule], async () => {
    if (shouldFail) {
      throw new Error("notification failed");
    }
  });

  await scenario.processor.process(createMetrics());
  assert.equal(rule.currentState, AlertRuleState.TRIGGERED);
  assert.equal(rule.lastNotificationAt, undefined);
  assert.equal(scenario.executions[0].status, AlertExecutionStatus.FAILED);

  shouldFail = false;
  await scenario.processor.process(createMetrics());
  assert.equal(scenario.getCreateCalls(), 2);
  assert.ok(rule.lastNotificationAt);
});

test("keeps the last successful notification after a failed reminder", async () => {
  const previousSentAt = new Date(Date.now() - 31 * 60 * 1000);
  const rule = restoreTriggeredRule(previousSentAt);
  const scenario = createScenario([rule], async () => {
    throw new Error("reminder failed");
  });

  await scenario.processor.process(createMetrics());

  assert.equal(scenario.executions[0].status, AlertExecutionStatus.FAILED);
  assert.equal(rule.lastNotificationAt?.getTime(), previousSentAt.getTime());
});

test("does not duplicate a concurrently processed rule and releases the lock", async () => {
  const rule = createRule();
  let release!: () => void;
  const pendingSend = new Promise<void>((resolve) => {
    release = resolve;
  });
  let sendStarted!: () => void;
  const started = new Promise<void>((resolve) => {
    sendStarted = resolve;
  });
  const scenario = createScenario([rule], async () => {
    sendStarted();
    await pendingSend;
  });
  const metrics = createMetrics();

  const first = scenario.processor.process(metrics);
  await started;
  await scenario.processor.process(metrics);
  assert.equal(scenario.getCreateCalls(), 1);
  release();
  await first;

  await scenario.processor.process(metrics);
  assert.equal(scenario.getCreateCalls(), 1);
});

test("processes different rules independently", async () => {
  const secondConnectionId = "550e8400-e29b-41d4-a716-446655440002";
  const firstRule = createRule();
  const secondRule = AlertRule.create({
    metric: AlertMetric.ACTIVE_CONNECTIONS,
    operator: AlertOperator.GREATER_THAN,
    threshold: 10,
    channel: NotificationChannel.WHATSAPP,
    destination: "5511999999999",
    cooldownMinutes: 30,
    databaseConnectionId: secondConnectionId,
  });
  let sends = 0;
  const scenario = createScenario(
    [firstRule, secondRule],
    async () => {
      sends++;
    },
    new Map([
      [CONNECTION_ID, createConnection(CONNECTION_ID)],
      [secondConnectionId, createConnection(secondConnectionId)],
    ]),
  );

  const first = scenario.processor.process(createMetrics(CONNECTION_ID));
  const second = scenario.processor.process(createMetrics(secondConnectionId));
  await first;
  await second;

  assert.equal(sends, 2);
  assert.equal(scenario.getCreateCalls(), 2);
});
