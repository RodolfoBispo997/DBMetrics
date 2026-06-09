"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnectionModule = void 0;
const common_1 = require("@nestjs/common");
const database_connection_controller_1 = require("./database-connection.controller");
const create_database_connection_use_case_1 = require("./application/use-cases/create-database-connection/create-database-connection.use-case");
const prisma_database_connection_repository_1 = require("./infra/repositories/prisma-database-connection.repository");
const prisma_user_repository_1 = require("../user/infra/repositories/prisma-user.repository");
const list_database_connections_use_case_1 = require("./application/use-cases/list-database-connections/list-database-connections.use-case");
const get_database_connections_by_id_use_case_1 = require("./application/use-cases/get-database-connection-by-id/get-database-connections-by-id.use-case");
const update_database_connection_use_case_1 = require("./application/use-cases/update-database-connection/update-database-connection.use-case");
let DatabaseConnectionModule = class DatabaseConnectionModule {
};
exports.DatabaseConnectionModule = DatabaseConnectionModule;
exports.DatabaseConnectionModule = DatabaseConnectionModule = __decorate([
    (0, common_1.Module)({
        controllers: [database_connection_controller_1.DatabaseConnectionController],
        providers: [
            create_database_connection_use_case_1.CreateDatabaseConnectionUseCase,
            {
                provide: "DatabaseConnectionRepository",
                useClass: prisma_database_connection_repository_1.PrismaDatabaseConnectionRepository,
            },
            {
                provide: "UserRepository",
                useClass: prisma_user_repository_1.PrismaUserRepository,
            },
            list_database_connections_use_case_1.ListDatabaseConnectionsUseCase,
            {
                provide: "DatabaseConnectionRepository",
                useClass: prisma_database_connection_repository_1.PrismaDatabaseConnectionRepository,
            },
            get_database_connections_by_id_use_case_1.GetDatabaseConnectionByIdUseCase,
            {
                provide: "DatabaseConnectionRepository",
                useClass: prisma_database_connection_repository_1.PrismaDatabaseConnectionRepository,
            },
            update_database_connection_use_case_1.UpdateDatabaseConnectionUseCase,
            {
                provide: "DatabaseConnectionRepository",
                useClass: prisma_database_connection_repository_1.PrismaDatabaseConnectionRepository,
            },
        ],
    })
], DatabaseConnectionModule);
//# sourceMappingURL=database-connection.module.js.map