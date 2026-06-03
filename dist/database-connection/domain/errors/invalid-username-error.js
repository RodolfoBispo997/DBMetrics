"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidUsernameError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidUsernameError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidUsernameError = InvalidUsernameError;
//# sourceMappingURL=invalid-username-error.js.map