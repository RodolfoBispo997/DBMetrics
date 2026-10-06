import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Prisma } from "../../../../generated/prisma/client";
import { DatabaseProvider } from "../../../database-connection/domain/enums/database-provider.enum";
import { PrismaService } from "../../../shared/infra/database/prisma/prisma.service";

import { AlertExecutionRepository, DeliveryClaimResult } from "../../application/repositories/alert-execution-repository";

import { AlertExecution } from "../../domain/entities/alert-execution";
import { AlertOutboxEvent } from "../../domain/entities/alert-outbox-event";

import { AlertExecutionStatus } from "../../domain/enums/alert-execution-status.enum";
import { AlertMetric } from "../../domain/enums/alert-metric.enum";
import { AlertOperator } from "../../domain/enums/alert-operator.enum";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";

@Injectable()
export class PrismaAlertExecutionRepository implements AlertExecutionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(alertExecution: AlertExecution): Promise<void> {
    await this.prisma.alertExecution.create({
      data: {
        id: alertExecution.id,

        alertRuleId: alertExecution.alertRuleId,
        databaseMetricId: alertExecution.databaseMetricId,
        databaseConnectionId: alertExecution.databaseConnectionId,
        connectionName: alertExecution.connectionName,
        databaseProvider: alertExecution.databaseProvider,
        host: alertExecution.host,
        databaseName: alertExecution.databaseName,
        port: alertExecution.port,
        metric: alertExecution.metric,
        operator: alertExecution.operator,

        metricValue: alertExecution.metricValue,
        threshold: alertExecution.threshold,
        destination: alertExecution.destination,
        channel: alertExecution.channel,

        status: alertExecution.status,

        errorMessage: alertExecution.errorMessage,

        triggeredAt: alertExecution.triggeredAt,
        sentAt: alertExecution.sentAt,
      },
    });
  }

  async saveWithOutbox(
    alertExecution: AlertExecution,
    alertOutboxEvent: AlertOutboxEvent,
  ): Promise<void> {
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.alertExecution.create({
        data: {
          id: alertExecution.id,
          alertRuleId: alertExecution.alertRuleId,
          databaseMetricId: alertExecution.databaseMetricId,
          databaseConnectionId: alertExecution.databaseConnectionId,
          connectionName: alertExecution.connectionName,
          databaseProvider: alertExecution.databaseProvider,
          host: alertExecution.host,
          databaseName: alertExecution.databaseName,
          port: alertExecution.port,
          metric: alertExecution.metric,
          operator: alertExecution.operator,
          metricValue: alertExecution.metricValue,
          threshold: alertExecution.threshold,
          destination: alertExecution.destination,
          channel: alertExecution.channel,
          status: alertExecution.status,
          errorMessage: alertExecution.errorMessage,
          triggeredAt: alertExecution.triggeredAt,
          sentAt: alertExecution.sentAt,
        },
      });

      await tx.alertOutboxEvent.create({
        data: {
          id: alertOutboxEvent.id,
          alertExecutionId: alertOutboxEvent.alertExecutionId,
          type: alertOutboxEvent.type,
          payload: alertOutboxEvent.payload as Prisma.InputJsonValue,
          idempotencyKey: alertOutboxEvent.idempotencyKey,
          publishAttemptCount: alertOutboxEvent.publishAttemptCount,
          availableAt: alertOutboxEvent.availableAt,
          publishedAt: alertOutboxEvent.publishedAt,
          lastError: alertOutboxEvent.lastError,
          createdAt: alertOutboxEvent.createdAt,
          updatedAt: alertOutboxEvent.updatedAt,
        },
      });
    });
  }

  async update(alertExecution: AlertExecution): Promise<void> {
    await this.prisma.alertExecution.update({
      where: {
        id: alertExecution.id,
      },

      data: {
        status: alertExecution.status,
        errorMessage: alertExecution.errorMessage,
        sentAt: alertExecution.sentAt,
      },
    });
  }

  async claimForDelivery(id: string, leaseMs: number): Promise<DeliveryClaimResult> {
    const current = await this.prisma.alertExecution.findUnique({ where: { id } });
    if (!current) return { kind: "missing" };
    if (current.status !== AlertExecutionStatus.PENDING) return { kind: "terminal" };
    if (current.deliveryClaimExpiresAt && current.deliveryClaimExpiresAt > new Date()) {
      return { kind: "busy", retryAfterMs: current.deliveryClaimExpiresAt.getTime() - Date.now() };
    }
    const claimToken = randomUUID();
    const result = await this.prisma.alertExecution.updateMany({
      where: {
        id,
        status: AlertExecutionStatus.PENDING,
        OR: [
          { deliveryClaimExpiresAt: null },
          { deliveryClaimExpiresAt: { lte: new Date() } },
        ],
      },
      data: {
        deliveryClaimedAt: new Date(),
        deliveryClaimExpiresAt: new Date(Date.now() + leaseMs),
        deliveryClaimToken: claimToken,
        deliveryAttemptCount: { increment: 1 },
      },
    });
    if (result.count !== 1) return { kind: "busy", retryAfterMs: 1000 };

    const claimedRow = await this.prisma.alertExecution.findUnique({ where: { id } });
    if (!claimedRow) return { kind: "missing" };
    if (claimedRow.deliveryClaimToken !== claimToken) {
      return { kind: "busy", retryAfterMs: 1000 };
    }

    const execution = await this.findById(id);
    return execution
      ? {
          kind: "claimed",
          claimToken,
          execution,
          deliveryAttemptCount: claimedRow.deliveryAttemptCount,
        }
      : { kind: "missing" };
  }

  async markDeliverySucceeded(id: string, alertRuleId: string, claimToken: string, sentAt: Date): Promise<boolean> {
    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.alertExecution.updateMany({
        where: { id, deliveryClaimToken: claimToken },
        data: { status: AlertExecutionStatus.SENT, sentAt, errorMessage: null, deliveryClaimedAt: null, deliveryClaimExpiresAt: null, deliveryClaimToken: null },
      });
      if (updated.count !== 1) return false;
      await tx.alertRule.update({ where: { id: alertRuleId }, data: { lastNotificationAt: sentAt, updatedAt: sentAt } });
      return true;
    });
    return result;
  }

  async markDeliveryRetry(id: string, outboxId: string, claimToken: string, availableAt: Date, error: string): Promise<boolean> {
    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.alertExecution.updateMany({ where: { id, deliveryClaimToken: claimToken }, data: { status: AlertExecutionStatus.PENDING, errorMessage: error, sentAt: null, deliveryClaimedAt: null, deliveryClaimExpiresAt: null, deliveryClaimToken: null } });
      if (updated.count !== 1) return false;
      await tx.alertOutboxEvent.update({ where: { id: outboxId }, data: { availableAt, publishedAt: null, claimedAt: null, claimExpiresAt: null, lastError: error, updatedAt: new Date() } });
      return true;
    });
    return result;
  }

  async markDeliveryFailed(id: string, outboxId: string, claimToken: string, error: string): Promise<boolean> {
    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.alertExecution.updateMany({ where: { id, deliveryClaimToken: claimToken }, data: { status: AlertExecutionStatus.FAILED, errorMessage: error, sentAt: null, deliveryClaimedAt: null, deliveryClaimExpiresAt: null, deliveryClaimToken: null } });
      if (updated.count !== 1) return false;
      await tx.alertOutboxEvent.update({ where: { id: outboxId }, data: { failedAt: new Date(), lastError: error, claimedAt: null, claimExpiresAt: null, updatedAt: new Date() } });
      return true;
    });
    return result;
  }

  async markPublicationFailed(id: string, outboxId: string, error: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.alertExecution.update({ where: { id }, data: { status: AlertExecutionStatus.FAILED, errorMessage: error, sentAt: null, deliveryClaimedAt: null, deliveryClaimExpiresAt: null, deliveryClaimToken: null } });
      await tx.alertOutboxEvent.update({ where: { id: outboxId }, data: { failedAt: new Date(), lastError: error, claimedAt: null, claimExpiresAt: null, updatedAt: new Date() } });
    });
  }

  async findById(id: string): Promise<AlertExecution | null> {
    const execution = await this.prisma.alertExecution.findUnique({
      where: {
        id,
      },
    });

    if (!execution) {
      return null;
    }

    return AlertExecution.restore({
      id: execution.id,

      alertRuleId: execution.alertRuleId,
      databaseMetricId: execution.databaseMetricId,
      databaseConnectionId: execution.databaseConnectionId,
      connectionName: execution.connectionName,
      databaseProvider: execution.databaseProvider as DatabaseProvider,
      host: execution.host,
      databaseName: execution.databaseName,
      port: execution.port,
      metric: execution.metric as AlertMetric,
      operator: execution.operator as AlertOperator,

      metricValue: execution.metricValue,
      threshold: execution.threshold,

      channel: execution.channel as NotificationChannel,
      destination: execution.destination,
      status: execution.status as AlertExecutionStatus,

      errorMessage: execution.errorMessage ?? undefined,

      triggeredAt: execution.triggeredAt,
      sentAt: execution.sentAt ?? undefined,
    });
  }

  async findManyByConnectionId(data: {
    connectionId: string;
    skip: number;
    take: number;
  }): Promise<{ executions: AlertExecution[]; total: number }> {
    const where = {
      databaseConnectionId: data.connectionId,
    };

    const [executions, total] = await Promise.all([
      this.prisma.alertExecution.findMany({
        where,
        orderBy: {
          triggeredAt: "desc",
        },
        skip: data.skip,
        take: data.take,
      }),
      this.prisma.alertExecution.count({ where }),
    ]);

    return {
      total,
      executions: executions.map((execution) =>
        AlertExecution.restore({
          id: execution.id,

          alertRuleId: execution.alertRuleId,
          databaseMetricId: execution.databaseMetricId,
          databaseConnectionId: execution.databaseConnectionId,
          connectionName: execution.connectionName,
          databaseProvider: execution.databaseProvider as DatabaseProvider,
          host: execution.host,
          databaseName: execution.databaseName,
          port: execution.port,
          metric: execution.metric as AlertMetric,
          operator: execution.operator as AlertOperator,

          metricValue: execution.metricValue,
          threshold: execution.threshold,

          channel: execution.channel as NotificationChannel,
          destination: execution.destination,
          status: execution.status as AlertExecutionStatus,

          errorMessage: execution.errorMessage ?? undefined,

          triggeredAt: execution.triggeredAt,
          sentAt: execution.sentAt ?? undefined,
        }),
      ),
    };
  }

  async findRecent(limit: number): Promise<AlertExecution[]> {
    const executions = await this.prisma.alertExecution.findMany({
      take: limit,

      orderBy: {
        triggeredAt: "desc",
      },
    });

    return executions.map((execution) =>
      AlertExecution.restore({
        id: execution.id,

        alertRuleId: execution.alertRuleId,
        databaseMetricId: execution.databaseMetricId,
        databaseConnectionId: execution.databaseConnectionId,
        connectionName: execution.connectionName,
        databaseProvider: execution.databaseProvider as DatabaseProvider,
        host: execution.host,
        databaseName: execution.databaseName,
        port: execution.port,
        metric: execution.metric as AlertMetric,
        operator: execution.operator as AlertOperator,

        metricValue: execution.metricValue,
        threshold: execution.threshold,

        channel: execution.channel as NotificationChannel,
        destination: execution.destination,
        status: execution.status as AlertExecutionStatus,

        errorMessage: execution.errorMessage ?? undefined,

        triggeredAt: execution.triggeredAt,
        sentAt: execution.sentAt ?? undefined,
      }),
    );
  }
}
