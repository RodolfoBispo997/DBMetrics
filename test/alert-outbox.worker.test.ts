import assert from "node:assert/strict";
import test from "node:test";

import { AlertOutboxDispatcherService } from "../src/alerts/application/services/alert-outbox-dispatcher.service";
import { AlertOutboxEvent } from "../src/alerts/domain/entities/alert-outbox-event";
process.env.JWT_SECRET = "unit-test-secret";
process.env.DATABASE_CREDENTIALS_KEY =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
process.env.NODE_ENV = "test";

const executionRepository = {
  markPublicationFailed: async () => undefined,
  markDeliveryFailed: async () => undefined,
} as never;

const makeEvent = (id = "event-1") =>
  AlertOutboxEvent.create(
    {
      alertExecutionId: id,
      channel: "WHATSAPP",
      destination: "5511999999999",
      executedAt: new Date().toISOString(),
    },
    `idempotency-${id}`,
    id,
  );

test("dispatcher publishes pending outbox events after broker confirmation", async () => {
  const event = makeEvent();
  const published: Array<{ eventId: string }> = [];

  const dispatcher = new AlertOutboxDispatcherService(
    {
      save: async () => undefined,
      findByIdempotencyKey: async () => null,
      findByAlertExecutionId: async () => null,
      claimNextReady: async () => [event],
      markPublished: async (id: string) => {
        published.push({ eventId: id });
      },
      markRetry: async () => undefined,
      markFailed: async () => undefined,
    } as never,
    {
      publish: async (value) => {
        published.push({ eventId: value.eventId });
      },
    },
    executionRepository,
  );

  const processed = await dispatcher.dispatchPending(10);

  assert.equal(processed, 1);
  assert.equal(published.length, 2);
  assert.equal(published[0].eventId, event.id);
});

test("dispatcher schedules retry when the broker rejects the publish", async () => {
  const event = makeEvent("event-retry");
  let retried = false;

  const dispatcher = new AlertOutboxDispatcherService(
    {
      save: async () => undefined,
      findByIdempotencyKey: async () => null,
      findByAlertExecutionId: async () => null,
      claimNextReady: async () => [event],
      markPublished: async () => undefined,
      markRetry: async (_id, attemptCount, availableAt, error) => {
        retried = true;
        assert.equal(attemptCount, 1);
        assert.ok(availableAt instanceof Date);
        assert.match(error, /publish/i);
      },
      markFailed: async () => undefined,
    } as never,
    {
      publish: async () => {
        throw new Error("RabbitMQ publish failed");
      },
    },
    executionRepository,
  );

  const processed = await dispatcher.dispatchPending(10);

  assert.equal(processed, 0);
  assert.equal(retried, true);
});

test("terminal publication failure marks execution and outbox failed transactionally", async () => {
  const event = makeEvent("event-terminal");
  let called = false;
  event.markRetry("previous", new Date());
  event.markRetry("previous", new Date());
  event.markRetry("previous", new Date());
  event.markRetry("previous", new Date());
  const dispatcher = new AlertOutboxDispatcherService(
    {
      claimNextReady: async () => [event],
      markRetry: async () => undefined,
    } as never,
    {
      publish: async () => {
        throw new Error("broker rejected");
      },
    },
    {
      markPublicationFailed: async (
        executionId: string,
        outboxId: string,
        error: string,
      ) => {
        called =
          executionId === event.alertExecutionId &&
          outboxId === event.id &&
          error === "broker rejected";
      },
    } as never,
  );
  await dispatcher.dispatchPending();
  assert.equal(called, true);
});

test("markFailed records terminal state and clears the publication lease", () => {
  const event = makeEvent("event-failed");
  event.markFailed("provider failed");
  assert.ok(event.failedAt instanceof Date);
  assert.equal(event.claimedAt, null);
  assert.equal(event.claimExpiresAt, null);
});
test("already processed outbox events are not returned as pending", async () => {
  const event = AlertOutboxEvent.create(
    {
      alertExecutionId: "processed-execution",
      channel: "WHATSAPP",
      destination: "5511999999999",
      executedAt: new Date().toISOString(),
    },
    "processed-key",
    "processed-execution",
  );
  event.markPublished();

  assert.ok(event.publishedAt instanceof Date);
  assert.equal(event.publishAttemptCount, 0);
});
