"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidAlertRuleIdError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidAlertRuleIdError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidAlertRuleIdError = InvalidAlertRuleIdError;
//# sourceMappingURL=invalid-alert-rule-id-error.js.map