"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTablesCountError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidTablesCountError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidTablesCountError = InvalidTablesCountError;
//# sourceMappingURL=invalid-tables-count-error.js.map