"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCredentialsError = void 0;
const common_1 = require("@nestjs/common");
class InvalidCredentialsError extends common_1.UnauthorizedException {
    constructor(message) {
        super(message);
        this.name = "InvalidCredentialsError";
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
//# sourceMappingURL=invalid-credentials-error.js.map