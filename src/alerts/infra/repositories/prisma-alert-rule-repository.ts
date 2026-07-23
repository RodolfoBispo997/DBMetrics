import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/infra/database/prisma/prisma.service";

import { AlertRuleRepository } from "../../application/repositories/alert-rule-repository";

import { AlertRule } from "../../domain/entities/alert-rule";
import { AlertMetric } from "../../domain/enums/alert-metric.enum";
import { AlertOperator } from "../../domain/enums/alert-operator.enum";
import { AlertRuleState } from "../../domain/enums/alert-rule-state.enum";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";

@Injectable()
export class PrismaAlertRuleRepository implements AlertRuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(alertRule: AlertRule): Promise<void> {
    await this.prisma.alertRule.create({
      data: {
        id: alertRule.id,
        metric: alertRule.metric,
        operator: alertRule.operator,
        threshold: alertRule.threshold,
        channel: alertRule.channel,
        destination: alertRule.destination,
        enabled: alertRule.enabled,
        cooldownMinutes: alertRule.cooldownMinutes,
        currentState: alertRule.currentState,
        lastNotificationAt: alertRule.lastNotificationAt,
        databaseConnectionId: alertRule.databaseConnectionId,
        createdAt: alertRule.createdAt,
        updatedAt: alertRule.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<AlertRule | null> {
    const alertRule = await this.prisma.alertRule.findUnique({
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
      cooldownMinutes: alertRule.cooldownMinutes,
      currentState: alertRule.currentState as AlertRuleState,
      lastNotificationAt: alertRule.lastNotificationAt,
      databaseConnectionId: alertRule.databaseConnectionId,
      createdAt: alertRule.createdAt,
      updatedAt: alertRule.updatedAt,
    });
  }

  async findManyByConnectionId(connectionId: string): Promise<AlertRule[]> {
    const alertRules = await this.prisma.alertRule.findMany({
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
        cooldownMinutes: alertRule.cooldownMinutes,
        currentState: alertRule.currentState as AlertRuleState,
        lastNotificationAt: alertRule.lastNotificationAt,
        databaseConnectionId: alertRule.databaseConnectionId,
        createdAt: alertRule.createdAt,
        updatedAt: alertRule.updatedAt,
      }),
    );
  }

  async update(alertRule: AlertRule): Promise<void> {
    await this.prisma.alertRule.update({
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
        cooldownMinutes: alertRule.cooldownMinutes,
        currentState: alertRule.currentState,
        lastNotificationAt: alertRule.lastNotificationAt,
        updatedAt: alertRule.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.alertRule.delete({
      where: {
        id,
      },
    });
  }
}
