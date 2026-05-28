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
exports.AuthenticateUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const invalid_credentials_error_1 = require("../../../domain/errors/invalid-credentials-error");
const jwt_1 = require("@nestjs/jwt");
let AuthenticateUserUseCase = class AuthenticateUserUseCase {
    constructor(userRepository, hashComparer, jwtService) {
        this.userRepository = userRepository;
        this.hashComparer = hashComparer;
        this.jwtService = jwtService;
    }
    async execute(data) {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new invalid_credentials_error_1.InvalidCredentialsError("Invalid credentials");
        }
        const passwordMatch = await this.hashComparer.compare(data.password, user.password);
        if (!passwordMatch) {
            throw new invalid_credentials_error_1.InvalidCredentialsError("Invalid credentials");
        }
        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            accessToken,
        };
    }
};
exports.AuthenticateUserUseCase = AuthenticateUserUseCase;
exports.AuthenticateUserUseCase = AuthenticateUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("UserRepository")),
    __param(1, (0, common_1.Inject)("HashComparer")),
    __metadata("design:paramtypes", [Object, Object, jwt_1.JwtService])
], AuthenticateUserUseCase);
//# sourceMappingURL=authenticate-user-use-case.js.map