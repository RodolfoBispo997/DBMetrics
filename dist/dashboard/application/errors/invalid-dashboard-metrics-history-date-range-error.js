"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDashboardMetricsHistoryDateRangeError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidDashboardMetricsHistoryDateRangeError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidDashboardMetricsHistoryDateRangeError = InvalidDashboardMetricsHistoryDateRangeError;
//# sourceMappingURL=invalid-dashboard-metrics-history-date-range-error.js.map