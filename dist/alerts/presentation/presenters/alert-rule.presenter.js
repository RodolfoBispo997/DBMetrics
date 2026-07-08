"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertRulePresenter = void 0;
class AlertRulePresenter {
    static toHTTP(alertRule) {
        return {
            id: alertRule.id,
            databaseConnectionId: alertRule.databaseConnectionId,
            metric: alertRule.metric,
            operator: alertRule.operator,
            threshold: alertRule.threshold,
            channel: alertRule.channel,
            enabled: alertRule.enabled,
            createdAt: alertRule.createdAt,
            updatedAt: alertRule.updatedAt,
        };
    }
}
exports.AlertRulePresenter = AlertRulePresenter;
//# sourceMappingURL=alert-rule.presenter.js.map