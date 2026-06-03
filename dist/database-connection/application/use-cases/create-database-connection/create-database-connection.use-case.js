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
exports.CreateDatabaseConnectionUseCase = void 0;
const common_1 = require("@nestjs/common");
const database_connection_1 = require("../../../domain/entities/database-connection");
const user_not_found_error_1 = require("../../../domain/errors/user-not-found-error");
let CreateDatabaseConnectionUseCase = class CreateDatabaseConnectionUseCase {
    constructor(databaseConnectionRepository, userRepository) {
        this.databaseConnectionRepository = databaseConnectionRepository;
        this.userRepository = userRepository;
    }
    async execute(data) {
        const databaseConnection = database_connection_1.DatabaseConnection.create({
            name: data.name,
            provider: data.provider,
            host: data.host,
            port: data.port,
            database: data.database,
            username: data.username,
            password: data.password,
            userId: data.userId,
        });
        const user = await this.userRepository.findById(databaseConnection.userId);
        if (!user) {
            throw new user_not_found_error_1.UserNotFoundError("User not found");
        }
        await this.databaseConnectionRepository.save(databaseConnection);
        return {
            id: databaseConnection.id,
            name: databaseConnection.name,
            provider: databaseConnection.provider,
            host: databaseConnection.host,
            port: databaseConnection.port,
            database: databaseConnection.database,
            username: databaseConnection.username,
            userId: databaseConnection.userId,
        };
    }
};
exports.CreateDatabaseConnectionUseCase = CreateDatabaseConnectionUseCase;
exports.CreateDatabaseConnectionUseCase = CreateDatabaseConnectionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("DatabaseConnectionRepository")),
    __param(1, (0, common_1.Inject)("UserRepository")),
    __metadata("design:paramtypes", [Object, Object])
], CreateDatabaseConnectionUseCase);
//# sourceMappingURL=create-database-connection.use-case.js.map