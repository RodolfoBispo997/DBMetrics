"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidAlertOperatorError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidAlertOperatorError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidAlertOperatorError = InvalidAlertOperatorError;
//# sourceMappingURL=invalid-alert-operator-error.js.map