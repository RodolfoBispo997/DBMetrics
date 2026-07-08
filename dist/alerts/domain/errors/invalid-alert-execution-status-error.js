"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidAlertExecutionStatusError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidAlertExecutionStatusError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidAlertExecutionStatusError = InvalidAlertExecutionStatusError;
//# sourceMappingURL=invalid-alert-execution-status-error.js.map