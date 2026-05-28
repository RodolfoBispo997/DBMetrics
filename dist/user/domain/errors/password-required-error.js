"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordRequiredError = void 0;
const domain_error_1 = require("./domain-error");
class PasswordRequiredError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason);
    }
}
exports.PasswordRequiredError = PasswordRequiredError;
//# sourceMappingURL=password-required-error.js.map