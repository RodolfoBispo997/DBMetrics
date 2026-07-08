"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDatabaseConnectionsIdError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidDatabaseConnectionsIdError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidDatabaseConnectionsIdError = InvalidDatabaseConnectionsIdError;
//# sourceMappingURL=invalid-database-connections-id-error.js.map