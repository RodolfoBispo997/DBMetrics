import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test, { after, afterEach, before, beforeEach } from "node:test";
import { connect, type ConfirmChannel, type ConsumeMessage } from "amqplib";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { RabbitMQContainer } from "@testcontainers/rabbitmq";

process.env.ALERT_OUTBOX_MAX_ATTEMPTS = "2";
process.env.ALERT_OUTBOX_RETRY_BASE_DELAY_MS = "1";
process.env.ALERT_OUTBOX_RETRY_MAX_DELAY_MS = "10";
process.env.ALERT_OUTBOX_LEASE_MS = "1000";
process.env.JWT_SECRET = "integration-secret";
process.env.DATABASE_CREDENTIALS_KEY =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
process.env.PUBLIC_REGISTRATION_ENABLED = "false";
process.env.NODE_ENV = "test";

import { AlertDeliveryConsumerService } from "../../src/alerts/application/services/alert-delivery-consumer.service";
import { AlertOutboxDispatcherService } from "../../src/alerts/application/services/alert-outbox-dispatcher.service";
import { AlertExecution } from "../../src/alerts/domain/entities/alert-execution";
import { AlertOutboxEvent } from "../../src/alerts/domain/entities/alert-outbox-event";
import { AlertMetric } from "../../src/alerts/domain/enums/alert-metric.enum";
import { AlertOperator } from "../../src/alerts/domain/enums/alert-operator.enum";
import { NotificationChannel } from "../../src/alerts/domain/enums/notification-channel.enum";
import { PrismaAlertExecutionRepository } from "../../src/alerts/infra/repositories/prisma-alert-execution.repository";
import { PrismaAlertOutboxRepository } from "../../src/alerts/infra/repositories/prisma-alert-outbox.repository";
import { PrismaService } from "../../src/shared/infra/database/prisma/prisma.service";

const EXCHANGE = "dbmetrics.alerts";
const DLX = "dbmetrics.alerts.dlx";
const QUEUE = "dbmetrics.alerts.queue";
const DLQ = "dbmetrics.alerts.dlq";
const RETRY = "dbmetrics.alerts.delivery-retry";
const KEY = "alert.notification";
let postgres: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
let rabbit: Awaited<ReturnType<RabbitMQContainer["start"]>>;
let prisma: PrismaService;
let adminConnection: Awaited<ReturnType<typeof connect>>;
let adminChannel: ConfirmChannel;
type ConsumerState = {
  consumerTags: string[];
  inFlight: Set<Promise<void>>;
};
const consumerStates = new WeakMap<ConfirmChannel, ConsumerState>();
type RabbitClient = { connection: Awaited<ReturnType<typeof connect>>; channel: ConfirmChannel };
let testClients: RabbitClient[] = [];

class FakeNotifier {
  calls = 0;
  failures = 0;
  received: AlertExecution[] = [];
  async send(execution: AlertExecution): Promise<void> {
    this.calls += 1;
    this.received.push(execution);
    if (this.failures > 0) {
      this.failures -= 1;
      throw new Error("fake notifier failure");
    }
  }
}

before(async () => {
  postgres = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("dbmetrics_alert_delivery")
    .withUsername("dbmetrics")
    .withPassword("dbmetrics-password")
    .start();
  rabbit = await new RabbitMQContainer("rabbitmq:3.13-management")
    .withExposedPorts(5672)
    .start();
  process.env.DATABASE_URL = postgres.getConnectionUri();
  const npmExecPath = process.env.npm_execpath;
  if (!npmExecPath) throw new Error("npm_execpath is required");
  const migration = spawnSync(
    process.execPath,
    [npmExecPath, "exec", "prisma", "migrate", "deploy"],
    { cwd: process.cwd(), env: process.env, stdio: "pipe" },
  );
  if (migration.status !== 0) throw new Error(migration.stderr.toString());
  prisma = new PrismaService();
  await prisma.$connect();
  adminConnection = await connect(rabbit.getAmqpUrl());
  adminChannel = await adminConnection.createConfirmChannel();
  await topology(adminChannel);
});
beforeEach(async () => {
  await adminChannel.purgeQueue(QUEUE);
  await adminChannel.purgeQueue(DLQ);
  await adminChannel.purgeQueue(RETRY);
  await prisma.alertOutboxEvent.deleteMany();
  await prisma.alertExecution.deleteMany();
  await prisma.alertRule.deleteMany();
  await prisma.databaseMetric.deleteMany();
  await prisma.databaseConnection.deleteMany();
  await prisma.user.deleteMany();
});
afterEach(async () => {
  await Promise.all(testClients.splice(0).map(closeRabbit));
});
after(async () => {
  await adminChannel?.close();
  await adminConnection?.close();
  await prisma?.$disconnect();
  await rabbit?.stop();
  await postgres?.stop();
});

async function topology(channel: ConfirmChannel) {
  await channel.assertExchange(EXCHANGE, "topic", { durable: true });
  await channel.assertExchange(DLX, "topic", { durable: true });
  await channel.assertQueue(QUEUE, {
    durable: true,
    arguments: { "x-dead-letter-exchange": DLX },
  });
  await channel.assertQueue(DLQ, { durable: true });
  await channel.assertQueue(RETRY, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": EXCHANGE,
      "x-dead-letter-routing-key": KEY,
    },
  });
  await channel.bindQueue(QUEUE, EXCHANGE, "alert.#");
  await channel.bindQueue(DLQ, DLX, "#");
}
async function rabbitChannel(): Promise<RabbitClient> {
  const connection = await connect(rabbit.getAmqpUrl());
  const channel = await connection.createConfirmChannel();
  await topology(channel);
  const client: RabbitClient = { connection, channel };
  testClients.push(client);
  return client;
}
async function publish(
  channel: ConfirmChannel,
  envelope: object,
  exchange = EXCHANGE,
  key = KEY,
  expiration?: number,
) {
  channel.publish(exchange, key, Buffer.from(JSON.stringify(envelope)), {
    persistent: true,
    ...(expiration ? { expiration: String(expiration) } : {}),
  });
  await channel.waitForConfirms();
}
async function eventually(
  check: () => Promise<boolean>,
  timeout = 5000,
): Promise<void> {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("timed out waiting for expected state");
}
async function seed() {
  const user = await prisma.user.create({
    data: {
      name: "Alert User",
      email: `delivery-${crypto.randomUUID()}@example.com`,
      password: "hash",
    },
  });
  const connection = await prisma.databaseConnection.create({
    data: {
      name: "conn",
      provider: "POSTGRESQL",
      host: "localhost",
      port: 5432,
      database: "db",
      username: "user",
      password: "secret",
      userId: user.id,
    },
  });
  const metric = await prisma.databaseMetric.create({
    data: {
      databaseConnectionId: connection.id,
      databaseVersion: "16",
      tablesCount: 1,
      viewsCount: 1,
      schemasCount: 1,
      indexesCount: 1,
      functionsCount: 1,
      databaseSize: 10,
      activeConnections: 1,
    },
  });
  const rule = await prisma.alertRule.create({
    data: {
      metric: AlertMetric.DATABASE_SIZE,
      operator: AlertOperator.GREATER_THAN,
      threshold: 1,
      channel: NotificationChannel.WHATSAPP,
      destination: "5511999999999",
      databaseConnectionId: connection.id,
    },
  });
  const execution = AlertExecution.create({
    alertRuleId: rule.id,
    databaseMetricId: metric.id,
    databaseConnectionId: connection.id,
    connectionName: connection.name,
    databaseProvider: connection.provider,
    host: connection.host,
    databaseName: connection.database,
    port: connection.port,
    metric: rule.metric,
    operator: rule.operator,
    metricValue: 2,
    threshold: 1,
    channel: rule.channel,
    destination: rule.destination,
  });
  const event = AlertOutboxEvent.create(
    {
      alertExecutionId: execution.id,
      channel: execution.channel,
      destination: execution.destination,
      executedAt: execution.triggeredAt.toISOString(),
    },
    execution.id,
    execution.id,
    new Date(Date.now() - 1_000),
  );
  const executions = new PrismaAlertExecutionRepository(prisma);
  const outbox = new PrismaAlertOutboxRepository(prisma);
  await executions.saveWithOutbox(execution, event);
  return { execution, event, rule, executions, outbox };
}
function envelope(event: AlertOutboxEvent) {
  return {
    eventId: event.id,
    alertExecutionId: event.alertExecutionId,
    idempotencyKey: event.idempotencyKey,
  };
}
async function consume(
  channel: ConfirmChannel,
  notifier: FakeNotifier,
  executions: PrismaAlertExecutionRepository,
  outbox: PrismaAlertOutboxRepository,
) {
  const consumer = new AlertDeliveryConsumerService(
    executions,
    outbox,
    notifier,
    {
      ack: (message: ConsumeMessage) => channel.ack(message),
      nackToDlq: (message: ConsumeMessage) =>
        channel.nack(message, false, false),
      scheduleRetry: async (message: ConsumeMessage, delay: number) => {
        await publish(
          channel,
          JSON.parse(message.content.toString()),
          "",
          RETRY,
          delay,
        );
      },
    },
  );
  const state = consumerStates.get(channel) ?? {
    consumerTags: [],
    inFlight: new Set<Promise<void>>(),
  };
  consumerStates.set(channel, state);
  const registration = await channel.consume(
    QUEUE,
    async (message) => {
      if (!message) return;
      const processing = consumer.handle(message, message.content);
      state.inFlight.add(processing);
      try {
        await processing;
      } finally {
        state.inFlight.delete(processing);
      }
    },
    { noAck: false },
  );
  state.consumerTags.push(registration.consumerTag);
  return registration;
}
async function closeRabbit(client: RabbitClient) {
  testClients = testClients.filter((openClient) => openClient !== client);
  const state = consumerStates.get(client.channel);
  for (const tag of state?.consumerTags ?? []) {
    await client.channel.cancel(tag);
  }
  await Promise.allSettled([...(state?.inFlight ?? [])]);
  await client.channel.close();
  await client.connection.close();
}
function dispatcher(
  outbox: PrismaAlertOutboxRepository,
  executions: PrismaAlertExecutionRepository,
  channel: ConfirmChannel,
) {
  return new AlertOutboxDispatcherService(
    outbox,
    { publish: async (value) => publish(channel, value) },
    executions,
  );
}

test("criação atômica grava execução PENDING e um único outbox", async () => {
  const item = await seed();
  assert.equal(
    await prisma.alertOutboxEvent.count({
      where: { alertExecutionId: item.execution.id },
    }),
    1,
  );
  assert.equal(
    (
      await prisma.alertExecution.findUnique({
        where: { id: item.execution.id },
      })
    )?.status,
    "PENDING",
  );
});
test("publicação confirmada publica envelope somente com IDs", async () => {
  const item = await seed();
  const rabbitClient = await rabbitChannel();
  const sent: object[] = [];
  const d = new AlertOutboxDispatcherService(
    item.outbox,
    {
      publish: async (value) => {
        sent.push(value);
        await publish(rabbitClient.channel, value);
      },
    },
    item.executions,
  );
  assert.equal(await d.dispatchPending(), 1);
  const row = await prisma.alertOutboxEvent.findUnique({
    where: { id: item.event.id },
  });
  assert.ok(row?.publishedAt);
  assert.deepEqual(Object.keys(sent[0]!).sort(), [
    "alertExecutionId",
    "eventId",
    "idempotencyKey",
  ]);
  await closeRabbit(rabbitClient);
});
test("entrega bem-sucedida atualiza execução e cooldown", async () => {
  const item = await seed();
  const r = await rabbitChannel();
  const notifier = new FakeNotifier();
  await consume(r.channel, notifier, item.executions, item.outbox);
  await publish(r.channel, envelope(item.event));
  await eventually(
    async () =>
      (
        await prisma.alertExecution.findUnique({
          where: { id: item.execution.id },
        })
      )?.status === "SENT",
  );
  const row = await prisma.alertExecution.findUnique({
    where: { id: item.execution.id },
  });
  const rule = await prisma.alertRule.findUnique({
    where: { id: item.rule.id },
  });
  assert.equal(notifier.calls, 1);
  assert.ok(row?.sentAt);
  assert.ok(rule?.lastNotificationAt);
  await closeRabbit(r);
});
test("falha transitória reagenda dispatcher e depois entrega", async () => {
  const item = await seed();
  const r = await rabbitChannel();
  const notifier = new FakeNotifier();
  notifier.failures = 1;
  await consume(r.channel, notifier, item.executions, item.outbox);
  const beforeFailure = new Date();
  await publish(r.channel, envelope(item.event));
  await eventually(
    async () =>
      (
        await prisma.alertOutboxEvent.findUnique({
          where: { id: item.event.id },
        })
      )?.lastError === "fake notifier failure",
  );
  let row = await prisma.alertOutboxEvent.findUnique({
    where: { id: item.event.id },
  });
  assert.ok(row?.availableAt);
  assert.ok(row.availableAt.getTime() >= beforeFailure.getTime());
  assert.equal(row?.publishedAt, null);
  assert.match(row?.lastError ?? "", /fake notifier failure/);
  await prisma.alertOutboxEvent.update({
    where: { id: item.event.id },
    data: { availableAt: new Date(Date.now() - 1_000) },
  });
  await dispatcher(item.outbox, item.executions, r.channel).dispatchPending();
  await eventually(
    async () =>
      (
        await prisma.alertExecution.findUnique({
          where: { id: item.execution.id },
        })
      )?.status === "SENT",
  );
  assert.equal(notifier.calls, 2);
  await closeRabbit(r);
});
test("falha terminal marca FAILED e envia à DLQ", async () => {
  const item = await seed();
  await prisma.alertExecution.update({
    where: { id: item.execution.id },
    data: { deliveryAttemptCount: 1 },
  });
  const r = await rabbitChannel();
  const notifier = new FakeNotifier();
  notifier.failures = 1;
  await consume(r.channel, notifier, item.executions, item.outbox);
  const beforeFailure = new Date();
  await publish(r.channel, envelope(item.event));
  await eventually(
    async () =>
      (
        await prisma.alertExecution.findUnique({
          where: { id: item.execution.id },
        })
      )?.status === "FAILED",
  );
  const outbox = await prisma.alertOutboxEvent.findUnique({
    where: { id: item.event.id },
  });
  assert.ok(outbox?.failedAt);
  await eventually(async () =>
    Boolean(await r.channel.get(DLQ, { noAck: true })),
  );
  await closeRabbit(r);
});
test("duplicata após SENT não reenvia", async () => {
  const item = await seed();
  const r = await rabbitChannel();
  const notifier = new FakeNotifier();
  await consume(r.channel, notifier, item.executions, item.outbox);
  await publish(r.channel, envelope(item.event));
  await eventually(
    async () =>
      (
        await prisma.alertExecution.findUnique({
          where: { id: item.execution.id },
        })
      )?.status === "SENT",
  );
  await publish(r.channel, envelope(item.event));
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(notifier.calls, 1);
  await closeRabbit(r);
});
test("dois consumidores concorrentes chamam notifier uma vez", async () => {
  const item = await seed();
  const r = await rabbitChannel();
  const second = await rabbitChannel();
  const notifier = new FakeNotifier();
  await consume(r.channel, notifier, item.executions, item.outbox);
  await consume(second.channel, notifier, item.executions, item.outbox);
  await publish(r.channel, envelope(item.event));
  await publish(r.channel, envelope(item.event));
  await eventually(
    async () =>
      (
        await prisma.alertExecution.findUnique({
          where: { id: item.execution.id },
        })
      )?.status === "SENT",
  );
  assert.equal(notifier.calls, 1);
  await closeRabbit(r);
  await closeRabbit(second);
});
test("lease ativo é recuperado pela fila de retry", async () => {
  const item = await seed();
  const r = await rabbitChannel();
  const notifier = new FakeNotifier();
  await consume(r.channel, notifier, item.executions, item.outbox);
  const claim = await item.executions.claimForDelivery(item.execution.id, 1000);
  assert.equal(claim.kind, "claimed");
  await publish(r.channel, envelope(item.event));
  await eventually(
    async () => (await r.channel.checkQueue(RETRY)).messageCount > 0,
  );
  await prisma.alertExecution.update({
    where: { id: item.execution.id },
    data: { deliveryClaimExpiresAt: new Date(Date.now() - 1) },
  });
  await eventually(
    async () =>
      (
        await prisma.alertExecution.findUnique({
          where: { id: item.execution.id },
        })
      )?.status === "SENT",
    6000,
  );
  assert.equal(notifier.calls, 1);
  await closeRabbit(r);
});
