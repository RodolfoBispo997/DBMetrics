"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidProviderDatabaseError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidProviderDatabaseError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidProviderDatabaseError = InvalidProviderDatabaseError;
//# sourceMappingURL=invalid-provider-database-error.js.map