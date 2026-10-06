import { Injectable } from "@nestjs/common";

import { Prisma } from "../../../../generated/prisma/client";
import { PrismaService } from "../../../shared/infra/database/prisma/prisma.service";
import { AlertOutboxRepository } from "../../application/repositories/alert-outbox-repository";
import { AlertOutboxEvent } from "../../domain/entities/alert-outbox-event";
import { getEnvironmentConfig } from "../../../shared/config/environment.config";

@Injectable()
export class PrismaAlertOutboxRepository implements AlertOutboxRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(event: AlertOutboxEvent): Promise<void> {
    await this.prisma.alertOutboxEvent.create({
      data: {
        id: event.id,
        alertExecutionId: event.alertExecutionId,
        type: event.type,
        payload: event.payload as Prisma.InputJsonValue,
        idempotencyKey: event.idempotencyKey,
        publishAttemptCount: event.publishAttemptCount,
        availableAt: event.availableAt,
        publishedAt: event.publishedAt,
        claimedAt: event.claimedAt,
        claimExpiresAt: event.claimExpiresAt,
        failedAt: event.failedAt,
        lastError: event.lastError,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      },
    });
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<AlertOutboxEvent | null> {
    const row = await this.prisma.alertOutboxEvent.findUnique({
      where: { idempotencyKey },
    });

    if (!row) {
      return null;
    }

    return AlertOutboxEvent.restore({
      id: row.id,
      alertExecutionId: row.alertExecutionId,
      type: row.type as "ALERT_NOTIFICATION",
      payload: row.payload as {
        alertExecutionId: string;
        channel: string;
        destination: string;
        executedAt: string;
      },
      idempotencyKey: row.idempotencyKey,
      publishAttemptCount: row.publishAttemptCount,
      availableAt: row.availableAt,
      publishedAt: row.publishedAt,
      lastError: row.lastError, claimedAt: row.claimedAt, claimExpiresAt: row.claimExpiresAt, failedAt: row.failedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findByAlertExecutionId(alertExecutionId: string): Promise<AlertOutboxEvent | null> {
    const row = await this.prisma.alertOutboxEvent.findUnique({
      where: { alertExecutionId },
    });

    if (!row) {
      return null;
    }

    return AlertOutboxEvent.restore({
      id: row.id,
      alertExecutionId: row.alertExecutionId,
      type: row.type as "ALERT_NOTIFICATION",
      payload: row.payload as {
        alertExecutionId: string;
        channel: string;
        destination: string;
        executedAt: string;
      },
      idempotencyKey: row.idempotencyKey,
      publishAttemptCount: row.publishAttemptCount,
      availableAt: row.availableAt,
      publishedAt: row.publishedAt,
      lastError: row.lastError, claimedAt: row.claimedAt, claimExpiresAt: row.claimExpiresAt, failedAt: row.failedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async claimNextReady(limit: number): Promise<AlertOutboxEvent[]> {
    const leaseMs = getEnvironmentConfig().alerts.outbox.leaseMs;
    const rows = await this.prisma.$queryRaw<Array<any>>`
      WITH candidates AS (
        SELECT "id" FROM "alert_outbox_events"
        WHERE "publishedAt" IS NULL AND "failedAt" IS NULL
          AND "availableAt" <= NOW()
          AND ("claimExpiresAt" IS NULL OR "claimExpiresAt" <= NOW())
        ORDER BY "availableAt" ASC, "createdAt" ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      UPDATE "alert_outbox_events" o
      SET "claimedAt" = NOW(), "claimExpiresAt" = NOW() + (${leaseMs} * INTERVAL '1 millisecond'), "updatedAt" = NOW()
      FROM candidates c WHERE o."id" = c."id"
      RETURNING o.*`;

    return rows.map((row) =>
      AlertOutboxEvent.restore({
        id: row.id,
        alertExecutionId: row.alertExecutionId,
        type: row.type as "ALERT_NOTIFICATION",
        payload: row.payload as {
          alertExecutionId: string;
          channel: string;
          destination: string;
          executedAt: string;
        },
        idempotencyKey: row.idempotencyKey,
        publishAttemptCount: row.publishAttemptCount,
        availableAt: row.availableAt,
        publishedAt: row.publishedAt,
        claimedAt: row.claimedAt, claimExpiresAt: row.claimExpiresAt, failedAt: row.failedAt,
        lastError: row.lastError,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  async markPublished(id: string, publishedAt: Date): Promise<void> {
    await this.prisma.alertOutboxEvent.update({
      where: { id },
      data: {
        publishedAt,
        lastError: null,
        claimedAt: null, claimExpiresAt: null,
        updatedAt: new Date(),
      },
    });
  }

  async markRetry(
    id: string,
    publishAttemptCount: number,
    availableAt: Date,
    sanitizedError: string,
  ): Promise<void> {
    await this.prisma.alertOutboxEvent.update({
      where: { id },
      data: {
        publishAttemptCount,
        availableAt,
        lastError: sanitizedError,
        claimedAt: null, claimExpiresAt: null,
        updatedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, sanitizedError: string): Promise<void> {
    await this.prisma.alertOutboxEvent.update({
      where: { id },
      data: {
        lastError: sanitizedError,
        failedAt: new Date(), claimedAt: null, claimExpiresAt: null,
        updatedAt: new Date(),
      },
    });
  }
}
