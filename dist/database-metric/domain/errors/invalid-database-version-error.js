"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDatabaseVersionError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidDatabaseVersionError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidDatabaseVersionError = InvalidDatabaseVersionError;
//# sourceMappingURL=invalid-database-version-error.js.map