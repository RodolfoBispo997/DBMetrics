"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertRuleNotFoundError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class AlertRuleNotFoundError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.AlertRuleNotFoundError = AlertRuleNotFoundError;
//# sourceMappingURL=alert-rule-not-found-error.js.map