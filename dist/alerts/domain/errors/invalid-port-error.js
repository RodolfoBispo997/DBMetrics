"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidPortError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidPortError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidPortError = InvalidPortError;
//# sourceMappingURL=invalid-port-error.js.map