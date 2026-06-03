"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotFoundError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class UserNotFoundError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.UserNotFoundError = UserNotFoundError;
//# sourceMappingURL=user-not-found-error.js.map