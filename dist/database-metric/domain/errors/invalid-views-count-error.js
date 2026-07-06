"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidViewsCountError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class InvalidViewsCountError extends domain_error_1.DomainError {
    constructor(reason) {
        super(reason, 400);
    }
}
exports.InvalidViewsCountError = InvalidViewsCountError;
//# sourceMappingURL=invalid-views-count-error.js.map