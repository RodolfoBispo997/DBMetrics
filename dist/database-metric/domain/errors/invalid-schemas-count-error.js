"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidSchemasCountError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidSchemasCountError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidSchemasCountError = InvalidSchemasCountError;
//# sourceMappingURL=invalid-schemas-count-error.js.map