import { AlertRule } from "../../domain/entities/alert-rule";

export class AlertRulePresenter {
  static toHTTP(alertRule: AlertRule) {
    return {
      id: alertRule.id,
      databaseConnectionId: alertRule.databaseConnectionId,
      metric: alertRule.metric,
      operator: alertRule.operator,
      threshold: alertRule.threshold,
      channel: alertRule.channel,
      destination: alertRule.destination,
      enabled: alertRule.enabled,
      cooldownMinutes: alertRule.cooldownMinutes,
      currentState: alertRule.currentState,
      lastNotificationAt: alertRule.lastNotificationAt,
      createdAt: alertRule.createdAt,
      updatedAt: alertRule.updatedAt,
    };
  }
}
