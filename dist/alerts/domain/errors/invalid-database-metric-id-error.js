"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDatabaseMetricIdError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidDatabaseMetricIdError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidDatabaseMetricIdError = InvalidDatabaseMetricIdError;
//# sourceMappingURL=invalid-database-metric-id-error.js.map