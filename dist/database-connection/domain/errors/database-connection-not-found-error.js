"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnectionNotFoundError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class DatabaseConnectionNotFoundError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.DatabaseConnectionNotFoundError = DatabaseConnectionNotFoundError;
//# sourceMappingURL=database-connection-not-found-error.js.map