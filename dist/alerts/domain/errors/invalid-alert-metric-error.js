"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidAlertMetricError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidAlertMetricError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidAlertMetricError = InvalidAlertMetricError;
//# sourceMappingURL=invalid-alert-metric-error.js.map