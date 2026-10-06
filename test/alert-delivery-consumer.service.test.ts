import assert from "node:assert/strict";
import test from "node:test";

process.env.JWT_SECRET = "unit-test-secret";
process.env.DATABASE_CREDENTIALS_KEY =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
process.env.NODE_ENV = "test";

import {
  AlertDeliveryConsumerService,
  DeliveryMessageTransport,
} from "../src/alerts/application/services/alert-delivery-consumer.service";
import {
  AlertExecutionRepository,
  DeliveryClaimResult,
} from "../src/alerts/application/repositories/alert-execution-repository";
import { AlertOutboxRepository } from "../src/alerts/application/repositories/alert-outbox-repository";
import { NotificationService } from "../src/alerts/application/services/notification.service";
import { AlertExecution } from "../src/alerts/domain/entities/alert-execution";
import { AlertOutboxEvent } from "../src/alerts/domain/entities/alert-outbox-event";
import { AlertMetric } from "../src/alerts/domain/enums/alert-metric.enum";
import { AlertOperator } from "../src/alerts/domain/enums/alert-operator.enum";
import { NotificationChannel } from "../src/alerts/domain/enums/notification-channel.enum";
import { DatabaseProvider } from "../src/database-connection/domain/enums/database-provider.enum";

const message = { id: "message-1" };
const content = JSON.stringify({
  eventId: "event-1",
  alertExecutionId: "execution-1",
  idempotencyKey: "key-1",
});
const execution = AlertExecution.create({
  alertRuleId: "11111111-1111-4111-8111-111111111111",
  databaseMetricId: "22222222-2222-4222-8222-222222222222",
  databaseConnectionId: "33333333-3333-4333-8333-333333333333",
  connectionName: "connection",
  databaseProvider: DatabaseProvider.POSTGRESQL,
  host: "localhost",
  databaseName: "db",
  port: 5432,
  metric: AlertMetric.DATABASE_SIZE,
  operator: AlertOperator.GREATER_THAN,
  metricValue: 2,
  threshold: 1,
  channel: NotificationChannel.WHATSAPP,
  destination: "5511999999999",
});
const outboxEvent = AlertOutboxEvent.create(
  {
    alertExecutionId: execution.id,
    channel: execution.channel,
    destination: execution.destination,
    executedAt: execution.triggeredAt.toISOString(),
  },
  "key-1",
  execution.id,
);

class FakeExecutions implements AlertExecutionRepository {
  claim: DeliveryClaimResult = {
    kind: "claimed",
    claimToken: "token-1",
    execution,
    deliveryAttemptCount: 1,
  };
  claimCalls = 0;
  success = true;
  retry = true;
  failed = true;
  successArgs: unknown[] = [];
  retryArgs: unknown[] = [];
  failedArgs: unknown[] = [];
  async save(): Promise<void> {}
  async saveWithOutbox(): Promise<void> {}
  async update(): Promise<void> {}
  async findById(): Promise<AlertExecution | null> {
    return execution;
  }
  async findManyByConnectionId(): Promise<{
    executions: AlertExecution[];
    total: number;
  }> {
    return { executions: [], total: 0 };
  }
  async findRecent(): Promise<AlertExecution[]> {
    return [];
  }
  async claimForDelivery(): Promise<DeliveryClaimResult> {
    this.claimCalls += 1;
    return this.claim;
  }
  async markDeliverySucceeded(
    ...args: [string, string, string, Date]
  ): Promise<boolean> {
    this.successArgs = args;
    return this.success;
  }
  async markDeliveryRetry(
    ...args: [string, string, string, Date, string]
  ): Promise<boolean> {
    this.retryArgs = args;
    return this.retry;
  }
  async markDeliveryFailed(
    ...args: [string, string, string, string]
  ): Promise<boolean> {
    this.failedArgs = args;
    return this.failed;
  }
  async markPublicationFailed(): Promise<void> {}
}
class FakeOutbox implements AlertOutboxRepository {
  async save(): Promise<void> {}
  async findByIdempotencyKey(): Promise<AlertOutboxEvent | null> {
    return null;
  }
  async findByAlertExecutionId(): Promise<AlertOutboxEvent | null> {
    return outboxEvent;
  }
  async claimNextReady(): Promise<AlertOutboxEvent[]> {
    return [];
  }
  async markPublished(): Promise<void> {}
  async markRetry(): Promise<void> {}
  async markFailed(): Promise<void> {}
}
class FakeTransport implements DeliveryMessageTransport<typeof message> {
  calls: string[] = [];
  retryError: Error | undefined;
  ack(): void {
    this.calls.push("ack");
  }
  nackToDlq(): void {
    this.calls.push("dlq");
  }
  async scheduleRetry(): Promise<void> {
    this.calls.push("retry");
    if (this.retryError) throw this.retryError;
  }
}
class FakeNotifier implements NotificationService {
  calls = 0;
  error: Error | undefined;
  async send(): Promise<void> {
    this.calls += 1;
    if (this.error) throw this.error;
  }
}
function makeService(claim?: DeliveryClaimResult) {
  const executions = new FakeExecutions();
  if (claim) executions.claim = claim;
  const outbox = new FakeOutbox();
  const notifier = new FakeNotifier();
  const transport = new FakeTransport();
  return {
    executions,
    outbox,
    notifier,
    transport,
    service: new AlertDeliveryConsumerService(
      executions,
      outbox,
      notifier,
      transport,
    ),
  };
}

test("JSON inválido faz ack sem claim nem notifier", async () => {
  const current = makeService();
  await current.service.handle(message, "{");
  assert.deepEqual(current.transport.calls, ["ack"]);
  assert.equal(current.notifier.calls, 0);
  assert.equal(current.executions.claimCalls, 0);
});
test("missing faz ack sem notifier", async () => {
  const current = makeService({ kind: "missing" });
  await current.service.handle(message, content);
  assert.deepEqual(current.transport.calls, ["ack"]);
  assert.equal(current.notifier.calls, 0);
  assert.equal(current.executions.claimCalls, 1);
});
test("terminal faz ack sem notifier", async () => {
  const current = makeService({ kind: "terminal" });
  await current.service.handle(message, content);
  assert.deepEqual(current.transport.calls, ["ack"]);
  assert.equal(current.notifier.calls, 0);
  assert.equal(current.executions.claimCalls, 1);
});
test("busy agenda retry antes do ack e falha de agendamento não confirma", async () => {
  const current = makeService({ kind: "busy", retryAfterMs: 2000 });
  await current.service.handle(message, content);
  assert.deepEqual(current.transport.calls, ["retry", "ack"]);
  const failed = makeService({ kind: "busy", retryAfterMs: 2000 });
  failed.transport.retryError = new Error("broker unavailable");
  await assert.rejects(() => failed.service.handle(message, content));
  assert.deepEqual(failed.transport.calls, ["retry"]);
});
test("sucesso chama notifier uma vez, persiste token e faz ack", async () => {
  const current = makeService();
  await current.service.handle(message, content);
  assert.equal(current.notifier.calls, 1);
  assert.equal(current.executions.successArgs[2], "token-1");
  assert.deepEqual(current.transport.calls, ["ack"]);
});
test("falha transitória persiste retry com token, outbox e backoff e faz ack", async () => {
  const current = makeService();
  current.notifier.error = new Error("temporary");
  await current.service.handle(message, content);
  assert.equal(current.executions.retryArgs[1], outboxEvent.id);
  assert.equal(current.executions.retryArgs[2], "token-1");
  assert.ok(current.executions.retryArgs[3] instanceof Date);
  assert.deepEqual(current.transport.calls, ["ack"]);
});
test("falha terminal marca FAILED com token e outbox e envia DLQ sem ack", async () => {
  const current = makeService({
    kind: "claimed",
    claimToken: "token-final",
    execution,
    deliveryAttemptCount: 5,
  });
  current.notifier.error = new Error("final");
  await current.service.handle(message, content);
  assert.equal(current.executions.failedArgs[1], outboxEvent.id);
  assert.equal(current.executions.failedArgs[2], "token-final");
  assert.deepEqual(current.transport.calls, ["dlq"]);
});
test("token obsoleto em sucesso e retry apenas confirma sem sobrescrever ou DLQ", async () => {
  const success = makeService();
  success.executions.success = false;
  await success.service.handle(message, content);
  assert.deepEqual(success.transport.calls, ["ack"]);
  const retry = makeService();
  retry.notifier.error = new Error("temporary");
  retry.executions.retry = false;
  await retry.service.handle(message, content);
  assert.deepEqual(retry.transport.calls, ["ack"]);
  assert.deepEqual(retry.transport.calls.includes("dlq"), false);
});
