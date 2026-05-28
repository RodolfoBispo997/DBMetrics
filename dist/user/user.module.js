"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const user_controller_1 = require("./user.controller");
const create_user_use_case_1 = require("./application/use-cases/create-user/create-user.use-case");
const prisma_user_repository_1 = require("./infra/repositories/prisma-user.repository");
const bcrypt_hash_generator_1 = require("../shared/cryptography/bcrypt-hash-generator");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        controllers: [user_controller_1.UserController],
        providers: [
            create_user_use_case_1.CreateUserUseCase,
            {
                provide: "UserRepository",
                useClass: prisma_user_repository_1.PrismaUserRepository,
            },
            {
                provide: "HashGenerator",
                useClass: bcrypt_hash_generator_1.BcryptHashGenerator,
            },
        ],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map