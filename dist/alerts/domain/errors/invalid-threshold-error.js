"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidThresholdError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidThresholdError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidThresholdError = InvalidThresholdError;
//# sourceMappingURL=invalid-threshold-error.js.map