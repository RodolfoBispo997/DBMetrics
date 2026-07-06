"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidFunctionsCountError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidFunctionsCountError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidFunctionsCountError = InvalidFunctionsCountError;
//# sourceMappingURL=invalid-functions-count-error.js.map