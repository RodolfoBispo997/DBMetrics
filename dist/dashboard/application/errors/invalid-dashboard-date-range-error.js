"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDashboardDateRangeError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidDashboardDateRangeError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidDashboardDateRangeError = InvalidDashboardDateRangeError;
//# sourceMappingURL=invalid-dashboard-date-range-error.js.map