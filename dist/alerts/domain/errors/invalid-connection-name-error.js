"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidConnectionNameError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidConnectionNameError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidConnectionNameError = InvalidConnectionNameError;
//# sourceMappingURL=invalid-connection-name-error.js.map