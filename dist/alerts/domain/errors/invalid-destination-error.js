"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDestinationError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidDestinationError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidDestinationError = InvalidDestinationError;
//# sourceMappingURL=invalid-destination-error.js.map