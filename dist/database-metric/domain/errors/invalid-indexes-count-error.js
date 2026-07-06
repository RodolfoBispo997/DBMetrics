"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidIndexesCountError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidIndexesCountError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidIndexesCountError = InvalidIndexesCountError;
//# sourceMappingURL=invalid-indexes-count-error.js.map