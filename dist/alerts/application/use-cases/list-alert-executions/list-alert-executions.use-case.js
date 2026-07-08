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
exports.ListAlertExecutionsUseCase = void 0;
const common_1 = require("@nestjs/common");
const invalid_database_connection_id_error_1 = require("../../../../database-metric/domain/errors/invalid-database-connection-id-error");
let ListAlertExecutionsUseCase = class ListAlertExecutionsUseCase {
    constructor(alertExecutionRepository, databaseConnectionRepository) {
        this.alertExecutionRepository = alertExecutionRepository;
        this.databaseConnectionRepository = databaseConnectionRepository;
    }
    async execute({ connectionId, userId, }) {
        const connection = await this.databaseConnectionRepository.findById(connectionId);
        if (!connection || connection.userId !== userId) {
            throw new invalid_database_connection_id_error_1.InvalidDatabaseConnectionIdError("Database connection not found");
        }
        return this.alertExecutionRepository.findManyByConnectionId(connectionId);
    }
};
exports.ListAlertExecutionsUseCase = ListAlertExecutionsUseCase;
exports.ListAlertExecutionsUseCase = ListAlertExecutionsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("AlertExecutionRepository")),
    __param(1, (0, common_1.Inject)("DatabaseConnectionRepository")),
    __metadata("design:paramtypes", [Object, Object])
], ListAlertExecutionsUseCase);
//# sourceMappingURL=list-alert-executions.use-case.js.map