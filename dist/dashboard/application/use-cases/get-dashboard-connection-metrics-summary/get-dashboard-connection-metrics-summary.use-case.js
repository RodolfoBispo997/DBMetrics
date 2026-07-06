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
exports.GetDashboardConnectionMetricsSummaryUseCase = void 0;
const common_1 = require("@nestjs/common");
const database_connection_not_found_error_1 = require("../../../../database-connection/domain/errors/database-connection-not-found-error");
const DASHBOARD_SUMMARY_PERIOD_HOURS = 24;
let GetDashboardConnectionMetricsSummaryUseCase = class GetDashboardConnectionMetricsSummaryUseCase {
    constructor(databaseConnectionRepository, databaseMetricRepository) {
        this.databaseConnectionRepository = databaseConnectionRepository;
        this.databaseMetricRepository = databaseMetricRepository;
    }
    async execute(data) {
        const connection = await this.databaseConnectionRepository.findById(data.connectionId);
        if (!connection || connection.userId !== data.userId) {
            throw new database_connection_not_found_error_1.DatabaseConnectionNotFoundError("Connection not found");
        }
        const endDate = new Date();
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - DASHBOARD_SUMMARY_PERIOD_HOURS);
        const history = await this.databaseMetricRepository.findHistoryByConnectionId({
            connectionId: connection.id,
            startDate,
            endDate,
        });
        if (history.length === 0) {
            return {
                connectionId: connection.id,
                current: null,
                growth: null,
            };
        }
        const latest = history[0];
        const oldest = history[history.length - 1];
        return {
            connectionId: connection.id,
            current: {
                databaseVersion: latest.databaseVersion,
                tablesCount: latest.tablesCount,
                viewsCount: latest.viewsCount,
                schemasCount: latest.schemasCount,
                indexesCount: latest.indexesCount,
                functionsCount: latest.functionsCount,
                databaseSize: latest.databaseSize,
                activeConnections: latest.activeConnections,
                collectedAt: latest.createdAt,
            },
            growth: {
                databaseSize: latest.databaseSize - oldest.databaseSize,
                tablesCount: latest.tablesCount - oldest.tablesCount,
                viewsCount: latest.viewsCount - oldest.viewsCount,
                schemasCount: latest.schemasCount - oldest.schemasCount,
                indexesCount: latest.indexesCount - oldest.indexesCount,
                functionsCount: latest.functionsCount - oldest.functionsCount,
                activeConnections: latest.activeConnections - oldest.activeConnections,
            },
        };
    }
};
exports.GetDashboardConnectionMetricsSummaryUseCase = GetDashboardConnectionMetricsSummaryUseCase;
exports.GetDashboardConnectionMetricsSummaryUseCase = GetDashboardConnectionMetricsSummaryUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("DatabaseConnectionRepository")),
    __param(1, (0, common_1.Inject)("DatabaseMetricRepository")),
    __metadata("design:paramtypes", [Object, Object])
], GetDashboardConnectionMetricsSummaryUseCase);
//# sourceMappingURL=get-dashboard-connection-metrics-summary.use-case.js.map