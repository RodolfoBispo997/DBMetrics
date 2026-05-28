"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidEmailError = void 0;
const domain_error_1 = require("./domain-error");
class InvalidEmailError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidEmailError = InvalidEmailError;
//# sourceMappingURL=invalid-email-error.js.map