"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDatabaseSizeError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidDatabaseSizeError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidDatabaseSizeError = InvalidDatabaseSizeError;
//# sourceMappingURL=invalid-database-size-error.js.map