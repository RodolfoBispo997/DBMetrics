"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertExecutionNotFoundError = void 0;
const domain_error_1 = require("../../../user/domain/errors/domain-error");
class AlertExecutionNotFoundError extends domain_error_1.DomainError {
    constructor() {
        super("Alert execution not found", 404);
    }
}
exports.AlertExecutionNotFoundError = AlertExecutionNotFoundError;
//# sourceMappingURL=alert-execution-not-found-error.js.map