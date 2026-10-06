CREATE TABLE "alert_outbox_events" (
    "id" TEXT NOT NULL,
    "alertExecutionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "publishAttemptCount" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "claimExpiresAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "alert_outbox_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "alert_outbox_events_alertExecutionId_fkey" FOREIGN KEY ("alertExecutionId") REFERENCES "alert_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "alert_outbox_events_alertExecutionId_key"
    ON "alert_outbox_events"("alertExecutionId");

CREATE UNIQUE INDEX "alert_outbox_events_idempotencyKey_key"
    ON "alert_outbox_events"("idempotencyKey");

CREATE INDEX "alert_outbox_events_availableAt_publishedAt_idx"
    ON "alert_outbox_events"("availableAt", "publishedAt");

CREATE INDEX "alert_outbox_events_publishedAt_idx"
    ON "alert_outbox_events"("publishedAt");

CREATE INDEX "alert_outbox_events_claim_idx"
    ON "alert_outbox_events"("claimExpiresAt", "availableAt", "publishedAt", "failedAt");

CREATE INDEX "alert_outbox_events_createdAt_idx"
    ON "alert_outbox_events"("createdAt");

ALTER TABLE "alert_executions"
    ADD COLUMN "deliveryClaimedAt" TIMESTAMP(3),
    ADD COLUMN "deliveryClaimExpiresAt" TIMESTAMP(3),
    ADD COLUMN "deliveryClaimToken" TEXT,
    ADD COLUMN "deliveryAttemptCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "alert_executions_delivery_claim_idx"
    ON "alert_executions"("deliveryClaimExpiresAt", "status");
