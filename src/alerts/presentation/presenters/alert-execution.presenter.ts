import { AlertExecution } from "../../domain/entities/alert-execution";

export class AlertExecutionPresenter {
  static toHTTP(alertExecution: AlertExecution) {
    return {
      id: alertExecution.id,

      alertRuleId: alertExecution.alertRuleId,
      databaseMetricId: alertExecution.databaseMetricId,
      databaseConnectionId: alertExecution.databaseConnectionId,

      metric: alertExecution.metric,
      operator: alertExecution.operator,

      metricValue: alertExecution.metricValue,
      threshold: alertExecution.threshold,

      channel: alertExecution.channel,

      status: alertExecution.status,

      errorMessage: alertExecution.errorMessage,

      triggeredAt: alertExecution.triggeredAt,
      sentAt: alertExecution.sentAt,
    };
  }
}
