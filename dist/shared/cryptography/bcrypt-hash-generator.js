"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptHashGenerator = void 0;
const bcryptjs_1 = require("bcryptjs");
class BcryptHashGenerator {
    async hash(payload) {
        const hashedPassword = await (0, bcryptjs_1.hash)(payload, 8);
        return hashedPassword;
    }
}
exports.BcryptHashGenerator = BcryptHashGenerator;
//# sourceMappingURL=bcrypt-hash-generator.js.map