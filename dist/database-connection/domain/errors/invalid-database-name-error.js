"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDatabaseNameError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidDatabaseNameError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidDatabaseNameError = InvalidDatabaseNameError;
//# sourceMappingURL=invalid-database-name-error.js.map