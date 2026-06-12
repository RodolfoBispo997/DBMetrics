"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDatabaseConnectionIdError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidDatabaseConnectionIdError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidDatabaseConnectionIdError = InvalidDatabaseConnectionIdError;
//# sourceMappingURL=invalid-database-connection-id-error.js.map