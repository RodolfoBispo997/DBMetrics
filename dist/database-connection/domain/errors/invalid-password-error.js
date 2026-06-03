"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidPasswordError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidPasswordError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidPasswordError = InvalidPasswordError;
//# sourceMappingURL=invalid-password-error.js.map