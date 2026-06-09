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
exports.DatabaseConnectionController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const create_database_connection_http_dto_1 = require("./presentation/dto/create-database-connection-http.dto");
const create_database_connection_use_case_1 = require("./application/use-cases/create-database-connection/create-database-connection.use-case");
const list_database_connections_use_case_1 = require("./application/use-cases/list-database-connections/list-database-connections.use-case");
const get_database_connections_by_id_use_case_1 = require("./application/use-cases/get-database-connection-by-id/get-database-connections-by-id.use-case");
const update_database_connection_use_case_1 = require("./application/use-cases/update-database-connection/update-database-connection.use-case");
const update_database_connection_http_dto_1 = require("./presentation/dto/update-database-connection-http.dto");
let DatabaseConnectionController = class DatabaseConnectionController {
    constructor(createDatabaseConnectionUseCase, listDatabaseConnectionsUseCase, getDatabaseConnectionByIdUseCase, updateDatabaseConnectionUseCase) {
        this.createDatabaseConnectionUseCase = createDatabaseConnectionUseCase;
        this.listDatabaseConnectionsUseCase = listDatabaseConnectionsUseCase;
        this.getDatabaseConnectionByIdUseCase = getDatabaseConnectionByIdUseCase;
        this.updateDatabaseConnectionUseCase = updateDatabaseConnectionUseCase;
    }
    async create(body) {
        return this.createDatabaseConnectionUseCase.execute(body);
    }
    async list(request) {
        return this.listDatabaseConnectionsUseCase.execute({
            userId: request.user.sub,
        });
    }
    async findById(request, id) {
        const userId = request.user.userId;
        return this.getDatabaseConnectionByIdUseCase.execute({ id, userId });
    }
    async update(request, id, body) {
        const userId = request.user.userId;
        return this.updateDatabaseConnectionUseCase.execute({
            id,
            userId,
            name: body.name,
            provider: body.provider,
            host: body.host,
            port: body.port,
            database: body.database,
            username: body.username,
            password: body.password,
        });
    }
};
exports.DatabaseConnectionController = DatabaseConnectionController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("ADMIN"),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_database_connection_http_dto_1.CreateDatabaseConnectionHttpDTO]),
    __metadata("design:returntype", Promise)
], DatabaseConnectionController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DatabaseConnectionController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DatabaseConnectionController.prototype, "findById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_database_connection_http_dto_1.UpdateDatabaseConnectionHttpDTO]),
    __metadata("design:returntype", Promise)
], DatabaseConnectionController.prototype, "update", null);
exports.DatabaseConnectionController = DatabaseConnectionController = __decorate([
    (0, common_1.Controller)("database-connections"),
    __metadata("design:paramtypes", [create_database_connection_use_case_1.CreateDatabaseConnectionUseCase,
        list_database_connections_use_case_1.ListDatabaseConnectionsUseCase,
        get_database_connections_by_id_use_case_1.GetDatabaseConnectionByIdUseCase,
        update_database_connection_use_case_1.UpdateDatabaseConnectionUseCase])
], DatabaseConnectionController);
//# sourceMappingURL=database-connection.controller.js.map