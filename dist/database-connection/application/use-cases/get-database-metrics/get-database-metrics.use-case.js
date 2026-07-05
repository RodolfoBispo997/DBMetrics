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
var GetDatabaseMetricsUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDatabaseMetricsUseCase = void 0;
const common_1 = require("@nestjs/common");
const database_connection_not_found_error_1 = require("../../../domain/errors/database-connection-not-found-error");
let GetDatabaseMetricsUseCase = GetDatabaseMetricsUseCase_1 = class GetDatabaseMetricsUseCase {
    constructor(databaseConnectionRepository, databaseMetricCollectorFactory, databaseHealthService) {
        this.databaseConnectionRepository = databaseConnectionRepository;
        this.databaseMetricCollectorFactory = databaseMetricCollectorFactory;
        this.databaseHealthService = databaseHealthService;
        this.logger = new common_1.Logger(GetDatabaseMetricsUseCase_1.name);
    }
    async execute(data) {
        const connection = await this.databaseConnectionRepository.findById(data.connectionId);
        if (!connection) {
            throw new database_connection_not_found_error_1.DatabaseConnectionNotFoundError("Database connection not found");
        }
        if (data.userId !== connection.userId) {
            throw new database_connection_not_found_error_1.DatabaseConnectionNotFoundError("Database connection not found");
        }
        const collector = this.databaseMetricCollectorFactory.get(connection.provider);
        try {
            const metrics = await collector.collect(connection);
            const health = this.databaseHealthService.evaluate(metrics);
            return {
                ...metrics,
                health,
            };
        }
        catch (error) {
            this.logger.error(error);
            return {
                databaseVersion: "",
                tablesCount: 0,
                viewsCount: 0,
                schemasCount: 0,
                indexesCount: 0,
                functionsCount: 0,
                databaseSize: 0,
                activeConnections: 0,
                health: {
                    status: "OFFLINE",
                    message: error instanceof Error ? error.message : "Database unavailable",
                    checkedAt: new Date(),
                },
            };
        }
    }
};
exports.GetDatabaseMetricsUseCase = GetDatabaseMetricsUseCase;
exports.GetDatabaseMetricsUseCase = GetDatabaseMetricsUseCase = GetDatabaseMetricsUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("DatabaseConnectionRepository")),
    __param(1, (0, common_1.Inject)("DatabaseMetricCollectorFactory")),
    __param(2, (0, common_1.Inject)("DatabaseHealthService")),
    __metadata("design:paramtypes", [Object, Object, Object])
], GetDatabaseMetricsUseCase);
//# sourceMappingURL=get-database-metrics.use-case.js.map