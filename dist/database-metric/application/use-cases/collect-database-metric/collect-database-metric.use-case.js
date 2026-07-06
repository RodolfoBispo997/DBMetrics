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
exports.CollectDatabaseMetricUseCase = void 0;
const common_1 = require("@nestjs/common");
const database_connection_not_found_error_1 = require("../../../../database-connection/domain/errors/database-connection-not-found-error");
const record_database_metric_use_case_1 = require("../record-database-metric/record-database-metric.use-case");
let CollectDatabaseMetricUseCase = class CollectDatabaseMetricUseCase {
    constructor(databaseConnectionRepository, recordDatabaseMetricUseCase) {
        this.databaseConnectionRepository = databaseConnectionRepository;
        this.recordDatabaseMetricUseCase = recordDatabaseMetricUseCase;
    }
    async execute(data) {
        const connection = await this.databaseConnectionRepository.findById(data.connectionId);
        if (!connection) {
            throw new database_connection_not_found_error_1.DatabaseConnectionNotFoundError("Database connection not found");
        }
        if (connection.userId !== data.userId) {
            throw new database_connection_not_found_error_1.DatabaseConnectionNotFoundError("Database connection not found");
        }
        await this.recordDatabaseMetricUseCase.execute(connection);
    }
};
exports.CollectDatabaseMetricUseCase = CollectDatabaseMetricUseCase;
exports.CollectDatabaseMetricUseCase = CollectDatabaseMetricUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("DatabaseConnectionRepository")),
    __metadata("design:paramtypes", [Object, record_database_metric_use_case_1.RecordDatabaseMetricUseCase])
], CollectDatabaseMetricUseCase);
//# sourceMappingURL=collect-database-metric.use-case.js.map