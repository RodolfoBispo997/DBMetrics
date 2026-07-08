"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidErrorMessageError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidErrorMessageError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidErrorMessageError = InvalidErrorMessageError;
//# sourceMappingURL=invalid-error-message-error.js.map