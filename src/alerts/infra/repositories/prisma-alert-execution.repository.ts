import { DatabaseProvider } from "../../../database-connection/domain/enums/database-provider.enum";
import { prisma } from "../../../user/infra/database/prisma/prisma-client";

import { AlertExecutionRepository } from "../../application/repositories/alert-execution-repository";

import { AlertExecution } from "../../domain/entities/alert-execution";

import { AlertExecutionStatus } from "../../domain/enums/alert-execution-status.enum";
import { AlertMetric } from "../../domain/enums/alert-metric.enum";
import { AlertOperator } from "../../domain/enums/alert-operator.enum";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";

export class PrismaAlertExecutionRepository implements AlertExecutionRepository {
  async save(alertExecution: AlertExecution): Promise<void> {
    await prisma.alertExecution.create({
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

  async update(alertExecution: AlertExecution): Promise<void> {
    await prisma.alertExecution.update({
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

  async findById(id: string): Promise<AlertExecution | null> {
    const execution = await prisma.alertExecution.findUnique({
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
      prisma.alertExecution.findMany({
        where,
        orderBy: {
          triggeredAt: "desc",
        },
        skip: data.skip,
        take: data.take,
      }),
      prisma.alertExecution.count({ where }),
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
    const executions = await prisma.alertExecution.findMany({
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
