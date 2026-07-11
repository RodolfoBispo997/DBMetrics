"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidHostError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidHostError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidHostError = InvalidHostError;
//# sourceMappingURL=invalid-host-error.js.map