"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertExecutionPresenter = void 0;
class AlertExecutionPresenter {
    static toHTTP(alertExecution) {
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
exports.AlertExecutionPresenter = AlertExecutionPresenter;
//# sourceMappingURL=alert-execution.presenter.js.map