import assert from "node:assert/strict";
import test from "node:test";

process.env.JWT_SECRET = "alert-email-test-secret";
process.env.DATABASE_CREDENTIALS_KEY = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
process.env.NODE_ENV = "test";

import { ResendEmailAlertNotificationService, type ResendAlertClient } from "../src/alerts/infra/notifications/resend-email-alert-notification.service";
import { NotificationFactoryImpl } from "../src/alerts/infra/notifications/notification.factory";
import { AlertDeliveryConsumerService } from "../src/alerts/application/services/alert-delivery-consumer.service";
import { EvolutionNotificationService } from "../src/alerts/infra/notifications/evolution/evolution-notification.service";
import { AlertExecution } from "../src/alerts/domain/entities/alert-execution";
import { AlertMetric } from "../src/alerts/domain/enums/alert-metric.enum";
import { AlertOperator } from "../src/alerts/domain/enums/alert-operator.enum";
import { NotificationChannel } from "../src/alerts/domain/enums/notification-channel.enum";
import { AlertExecutionStatus } from "../src/alerts/domain/enums/alert-execution-status.enum";
import { DatabaseProvider } from "../src/database-connection/domain/enums/database-provider.enum";

const recipient = "private.person@example.com";
const fakeApiKey = "re_123456789012345678901234567890";
const from = "DBMetrics <alerts@example.com>";
const execution = AlertExecution.create({
  alertRuleId: "11111111-1111-4111-8111-111111111111",
  databaseMetricId: "22222222-2222-4222-8222-222222222222",
  databaseConnectionId: "33333333-3333-4333-8333-333333333333",
  connectionName: "Production-like DB",
  databaseProvider: DatabaseProvider.POSTGRESQL,
  host: "localhost",
  databaseName: "metrics",
  port: 5432,
  metric: AlertMetric.DATABASE_SIZE,
  operator: AlertOperator.GREATER_THAN,
  metricValue: 20,
  threshold: 10,
  channel: NotificationChannel.EMAIL,
  destination: recipient,
});

function captureLogs() {
  const entries: unknown[] = [];
  const info = console.info;
  const error = console.error;
  console.info = (entry?: unknown) => { entries.push(entry); };
  console.error = (entry?: unknown) => { entries.push(entry); };
  return {
    entries,
    restore: () => { console.info = info; console.error = error; },
  };
}

test("Resend alert sends content to the configured recipient and logs only masked metadata", async () => {
  const sent: Array<Record<string, unknown>> = [];
  const client: ResendAlertClient = { emails: { send: async (message) => { sent.push(message); return { error: null }; } } };
  const logs = captureLogs();
  try {
    await new ResendEmailAlertNotificationService(client, from).send(execution);
  } finally {
    logs.restore();
  }
  assert.equal(sent.length, 1);
  assert.equal(sent[0].from, from);
  assert.equal(sent[0].to, recipient);
  assert.match(String(sent[0].text), /DATABASE_SIZE/);
  const serializedLogs = JSON.stringify(logs.entries);
  assert.match(serializedLogs, /p\*+@example\.com/);
  assert.doesNotMatch(serializedLogs, new RegExp(recipient.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(serializedLogs, new RegExp(fakeApiKey));
  assert.match(serializedLogs, /"status":"success"/);
});

test("Resend errors expose a safe code/message to logs and a generic retryable error", async () => {
  const client: ResendAlertClient = { emails: { send: async () => ({
    error: { code: "rate_limit_exceeded", message: `Rejected ${recipient} with ${fakeApiKey}` },
  }) } };
  const logs = captureLogs();
  try {
    await assert.rejects(
      new ResendEmailAlertNotificationService(client, from).send(execution),
      { message: "Resend alert email delivery failed" },
    );
  } finally {
    logs.restore();
  }
  const serializedLogs = JSON.stringify(logs.entries);
  assert.match(serializedLogs, /rate_limit_exceeded/);
  assert.match(serializedLogs, /REDACTED_RECIPIENT/);
  assert.doesNotMatch(serializedLogs, new RegExp(recipient.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(serializedLogs, new RegExp(fakeApiKey));
});

test("EMAIL failure retries the same pending execution and success marks that execution SENT", async () => {
  let sendCount = 0;
  const client: ResendAlertClient = { emails: { send: async () => {
    sendCount++;
    return sendCount === 1 ? { error: { code: "temporary", message: "temporary provider failure" } } : { error: null };
  } } };
  let attempts = 0;
  let persistedStatus = AlertExecutionStatus.PENDING;
  const retryIds: string[] = [];
  const successIds: string[] = [];
  const outbox = { id: "same-outbox", alertExecutionId: execution.id };
  const executions = {
    claimForDelivery: async () => ({ kind: "claimed" as const, claimToken: `claim-${++attempts}`, execution, deliveryAttemptCount: attempts }),
    markDeliveryRetry: async (id: string) => { retryIds.push(id); return true; },
    markDeliverySucceeded: async (id: string) => { successIds.push(id); persistedStatus = AlertExecutionStatus.SENT; return true; },
    markDeliveryFailed: async () => false,
  };
  const outboxes = { findByAlertExecutionId: async () => outbox };
  const transport = { ack: () => undefined, nackToDlq: () => undefined, scheduleRetry: async () => undefined };
  const consumer = new AlertDeliveryConsumerService(
    executions as never,
    outboxes as never,
    new ResendEmailAlertNotificationService(client, from),
    transport,
  );
  const payload = JSON.stringify({ eventId: "outbox-event", alertExecutionId: execution.id, idempotencyKey: execution.id });
  const logs = captureLogs();
  try {
    await consumer.handle({}, payload);
    assert.equal(persistedStatus, AlertExecutionStatus.PENDING);
    await consumer.handle({}, payload);
  } finally {
    logs.restore();
  }
  assert.equal(sendCount, 2);
  assert.deepEqual(retryIds, [execution.id]);
  assert.deepEqual(successIds, [execution.id]);
  assert.equal(persistedStatus, AlertExecutionStatus.SENT);
  const serializedLogs = JSON.stringify(logs.entries);
  assert.doesNotMatch(serializedLogs, new RegExp(fakeApiKey));
  assert.doesNotMatch(serializedLogs, new RegExp(recipient.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
test("notification factory routes EMAIL to Resend and retains WhatsApp", () => {
  const evolution = {} as EvolutionNotificationService;
  const email = new ResendEmailAlertNotificationService(
    { emails: { send: async () => ({ error: null }) } }, from,
  );
  const factory = new NotificationFactoryImpl(evolution, email);
  assert.equal(factory.get(NotificationChannel.EMAIL), email);
  assert.equal(factory.get(NotificationChannel.WHATSAPP), evolution);
});

test("EMAIL execution starts PENDING and its normal delivery transition becomes SENT", () => {
  assert.equal(execution.status, AlertExecutionStatus.PENDING);
  execution.markAsSent();
  assert.equal(execution.status, AlertExecutionStatus.SENT);
});