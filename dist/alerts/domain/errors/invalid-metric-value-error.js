"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidMetricValueError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidMetricValueError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidMetricValueError = InvalidMetricValueError;
//# sourceMappingURL=invalid-metric-value-error.js.map