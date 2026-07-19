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
      createdAt: alertRule.createdAt,
      updatedAt: alertRule.updatedAt,
    };
  }
}
