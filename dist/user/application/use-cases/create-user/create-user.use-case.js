"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../../../domain/entities/user.entity");
const user_role_enum_1 = require("../../../domain/enums/user-role.enum");
const email_already_exists_error_1 = require("../../../domain/errors/email-already-exists-error");
let CreateUserUseCase = class CreateUserUseCase {
    constructor(userRepository, hashGenerator) {
        this.userRepository = userRepository;
        this.hashGenerator = hashGenerator;
    }
    async execute(data) {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new email_already_exists_error_1.EmailAlreadyExistsError("Email already exist");
        }
        const hashedPassword = await this.hashGenerator.hash(data.password);
        const user = user_entity_1.User.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role ?? user_role_enum_1.UserRole.ADMIN,
        });
        await this.userRepository.save(user);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }
};
exports.CreateUserUseCase = CreateUserUseCase;
exports.CreateUserUseCase = CreateUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("UserRepository")),
    __param(1, (0, common_1.Inject)("HashGenerator")),
    __metadata("design:paramtypes", [Object, Object])
], CreateUserUseCase);
//# sourceMappingURL=create-user.use-case.js.map