import { prisma } from "../../../user/infra/database/prisma/prisma-client";

import { AlertRuleRepository } from "../../application/repositories/alert-rule-repository";

import { AlertRule } from "../../domain/entities/alert-rule";
import { AlertMetric } from "../../domain/enums/alert-metric.enum";
import { AlertOperator } from "../../domain/enums/alert-operator.enum";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";

export class PrismaAlertRuleRepository implements AlertRuleRepository {
  async save(alertRule: AlertRule): Promise<void> {
    await prisma.alertRule.create({
      data: {
        id: alertRule.id,
        metric: alertRule.metric,
        operator: alertRule.operator,
        threshold: alertRule.threshold,
        channel: alertRule.channel,
        destination: alertRule.destination,
        enabled: alertRule.enabled,
        databaseConnectionId: alertRule.databaseConnectionId,
        createdAt: alertRule.createdAt,
        updatedAt: alertRule.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<AlertRule | null> {
    const alertRule = await prisma.alertRule.findUnique({
      where: {
        id,
      },
    });

    if (!alertRule) {
      return null;
    }

    return AlertRule.restore({
      id: alertRule.id,

      metric: alertRule.metric as AlertMetric,
      operator: alertRule.operator as AlertOperator,
      threshold: alertRule.threshold,
      channel: alertRule.channel as NotificationChannel,
      destination: alertRule.destination,
      enabled: alertRule.enabled,
      databaseConnectionId: alertRule.databaseConnectionId,
      createdAt: alertRule.createdAt,
      updatedAt: alertRule.updatedAt,
    });
  }

  async findManyByConnectionId(connectionId: string): Promise<AlertRule[]> {
    const alertRules = await prisma.alertRule.findMany({
      where: {
        databaseConnectionId: connectionId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return alertRules.map((alertRule) =>
      AlertRule.restore({
        id: alertRule.id,

        metric: alertRule.metric as AlertMetric,
        operator: alertRule.operator as AlertOperator,
        threshold: alertRule.threshold,
        channel: alertRule.channel as NotificationChannel,
        destination: alertRule.destination,
        enabled: alertRule.enabled,
        databaseConnectionId: alertRule.databaseConnectionId,
        createdAt: alertRule.createdAt,
        updatedAt: alertRule.updatedAt,
      }),
    );
  }

  async update(alertRule: AlertRule): Promise<void> {
    await prisma.alertRule.update({
      where: {
        id: alertRule.id,
      },

      data: {
        metric: alertRule.metric,
        operator: alertRule.operator,
        threshold: alertRule.threshold,
        channel: alertRule.channel,
        destination: alertRule.destination,
        enabled: alertRule.enabled,
        updatedAt: alertRule.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.alertRule.delete({
      where: {
        id,
      },
    });
  }
}
