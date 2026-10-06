import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test, { after, before } from "node:test";
import { connect, type ConfirmChannel } from "amqplib";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { RabbitMQContainer } from "@testcontainers/rabbitmq";

import { AlertExecution } from "../../src/alerts/domain/entities/alert-execution";
import { AlertOutboxEvent } from "../../src/alerts/domain/entities/alert-outbox-event";
import { AlertExecutionStatus } from "../../src/alerts/domain/enums/alert-execution-status.enum";
import { AlertMetric } from "../../src/alerts/domain/enums/alert-metric.enum";
import { AlertOperator } from "../../src/alerts/domain/enums/alert-operator.enum";
import { NotificationChannel } from "../../src/alerts/domain/enums/notification-channel.enum";
import { PrismaAlertExecutionRepository } from "../../src/alerts/infra/repositories/prisma-alert-execution.repository";
import { PrismaAlertOutboxRepository } from "../../src/alerts/infra/repositories/prisma-alert-outbox.repository";
import { AlertOutboxDispatcherService } from "../../src/alerts/application/services/alert-outbox-dispatcher.service";
import { PrismaService } from "../../src/shared/infra/database/prisma/prisma.service";

let postgresContainer:
  | Awaited<ReturnType<PostgreSqlContainer["start"]>>
  | undefined;
let rabbitContainer:
  | Awaited<ReturnType<RabbitMQContainer["start"]>>
  | undefined;
let prisma: PrismaService;

before(async () => {
  postgresContainer = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("dbmetrics_outbox_test")
    .withUsername("dbmetrics")
    .withPassword("dbmetrics-password")
    .start();

  rabbitContainer = await new RabbitMQContainer("rabbitmq:3.13-management")
    .withExposedPorts(5672, 15672)
    .start();

  process.env.DATABASE_URL = postgresContainer.getConnectionUri();
  process.env.JWT_SECRET = "integration-secret";
  process.env.DATABASE_CREDENTIALS_KEY =
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  process.env.PUBLIC_REGISTRATION_ENABLED = "false";
  process.env.CORS_ORIGIN = "http://localhost:3000";
  process.env.LOG_LEVEL = "info";

  const npmExecPath = process.env.npm_execpath;
  if (!npmExecPath) {
    throw new Error("npm_execpath is required for Prisma migration execution");
  }

  const result = spawnSync(
    process.execPath,
    [npmExecPath, "exec", "prisma", "migrate", "deploy"],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: "pipe",
    },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr?.toString() || "Prisma migration failed");
  }

  prisma = new PrismaService();
  await prisma.$connect();
});

after(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
  if (rabbitContainer) {
    await rabbitContainer.stop();
  }
  if (postgresContainer) {
    await postgresContainer.stop();
  }
});

test("publishes a pending alert outbox event to RabbitMQ in a real Postgres and RabbitMQ stack", async () => {
  if (!postgresContainer || !rabbitContainer) {
    throw new Error("test containers were not started");
  }

  const user = await prisma.user.create({
    data: {
      name: "Alert Test User",
      email: `alert-${Date.now()}@example.com`,
      password: "hashed-password",
    },
  });

  const connection = await prisma.databaseConnection.create({
    data: {
      name: "Alert Integration Connection",
      provider: "POSTGRESQL",
      host: "localhost",
      port: 5432,
      database: "dbmetrics",
      username: "postgres",
      password: "secret",
      userId: user.id,
    },
  });

  const metric = await prisma.databaseMetric.create({
    data: {
      databaseConnectionId: connection.id,
      databaseVersion: "PostgreSQL 16",
      tablesCount: 10,
      viewsCount: 2,
      schemasCount: 1,
      indexesCount: 5,
      functionsCount: 2,
      databaseSize: 1024,
      activeConnections: 17,
    },
  });

  const alertRule = await prisma.alertRule.create({
    data: {
      metric: AlertMetric.DATABASE_SIZE,
      operator: AlertOperator.GREATER_THAN,
      threshold: 100,
      channel: NotificationChannel.WHATSAPP,
      enabled: true,
      cooldownMinutes: 30,
      databaseConnectionId: connection.id,
      destination: "5511999999999",
    },
  });

  const execution = AlertExecution.create({
    alertRuleId: alertRule.id,
    databaseMetricId: metric.id,
    databaseConnectionId: connection.id,
    connectionName: connection.name,
    databaseProvider: connection.provider,
    host: connection.host,
    databaseName: connection.database,
    port: connection.port,
    metric: alertRule.metric,
    operator: alertRule.operator,
    metricValue: 150,
    threshold: 100,
    channel: alertRule.channel,
    destination: alertRule.destination,
  });

  const repository = new PrismaAlertExecutionRepository(prisma);
  const outboxRepository = new PrismaAlertOutboxRepository(prisma);
  const outboxEvent = AlertOutboxEvent.create(
    {
      alertExecutionId: execution.id,
      channel: execution.channel,
      destination: execution.destination,
      executedAt: execution.triggeredAt.toISOString(),
    },
    execution.id,
    execution.id,
  );

  await repository.saveWithOutbox!(execution, outboxEvent);

  const connectionToRabbit = await connect(rabbitContainer.getAmqpUrl());
  const channel =
    (await connectionToRabbit.createConfirmChannel()) as ConfirmChannel;
  await channel.assertExchange("dbmetrics.alerts", "topic", { durable: true });
  await channel.assertQueue("dbmetrics.alerts.queue", {
    durable: true,
    arguments: { "x-dead-letter-exchange": "dbmetrics.alerts.dlx" },
  });
  await channel.bindQueue(
    "dbmetrics.alerts.queue",
    "dbmetrics.alerts",
    "alert.#",
  );

  const executionRepository = {
    markPublicationFailed: async () => undefined,
  } as never;
  const dispatcher = new AlertOutboxDispatcherService(
    outboxRepository,
    {
      publish: async (value) => {
        channel.publish(
          "dbmetrics.alerts",
          "alert.notification",
          Buffer.from(JSON.stringify(value)),
          { persistent: true },
        );
        await channel.waitForConfirms();
      },
    },
    executionRepository,
  );

  const processed = await dispatcher.dispatchPending(10);
  const received = await channel.get("dbmetrics.alerts.queue");

  assert.equal(processed, 1);
  assert.ok(received, "expected a message in the alert queue");
  assert.equal(
    JSON.parse(received!.content.toString()).alertExecutionId,
    execution.id,
  );

  await channel.close();
  await connectionToRabbit.close();

  const persistedExecution = await prisma.alertExecution.findUnique({
    where: { id: execution.id },
  });

  assert.ok(persistedExecution);
  assert.equal(persistedExecution?.status, AlertExecutionStatus.PENDING);
});
