"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidNameError = void 0;
const domain_error_1 = require("./domain-error");
class InvalidNameError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason);
    }
}
exports.InvalidNameError = InvalidNameError;
//# sourceMappingURL=invalid-name-error.js.map