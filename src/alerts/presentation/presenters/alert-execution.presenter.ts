import { AlertExecution } from "../../domain/entities/alert-execution";

export class AlertExecutionPresenter {
  static toHTTP(alertExecution: AlertExecution) {
    return {
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
      channel: alertExecution.channel,
      destination: alertExecution.destination,
      status: alertExecution.status,
      errorMessage: alertExecution.errorMessage,
      triggeredAt: alertExecution.triggeredAt,
      sentAt: alertExecution.sentAt,
    };
  }
}
