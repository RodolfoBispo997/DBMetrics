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
exports.GetDashboardConnectionMetricsChartUseCase = void 0;
const common_1 = require("@nestjs/common");
const database_connection_not_found_error_1 = require("../../../../database-connection/domain/errors/database-connection-not-found-error");
const resolve_dashboard_date_range_1 = require("../../utils/resolve-dashboard-date-range");
let GetDashboardConnectionMetricsChartUseCase = class GetDashboardConnectionMetricsChartUseCase {
    constructor(databaseConnectionRepository, databaseMetricRepository) {
        this.databaseConnectionRepository = databaseConnectionRepository;
        this.databaseMetricRepository = databaseMetricRepository;
    }
    async execute(data) {
        const connection = await this.databaseConnectionRepository.findById(data.connectionId);
        if (!connection || connection.userId !== data.userId) {
            throw new database_connection_not_found_error_1.DatabaseConnectionNotFoundError("Connection not found");
        }
        const { startDate, endDate } = (0, resolve_dashboard_date_range_1.resolveDashboardDateRange)({
            startDate: data.startDate,
            endDate: data.endDate,
        });
        const metrics = await this.databaseMetricRepository.findHistoryByConnectionId({
            connectionId: connection.id,
            startDate,
            endDate,
        });
        const sortedMetrics = [...metrics].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        return {
            connectionId: connection.id,
            charts: {
                databaseSize: sortedMetrics.map((metric) => ({
                    collectedAt: metric.createdAt,
                    value: metric.databaseSize,
                })),
                activeConnections: sortedMetrics.map((metric) => ({
                    collectedAt: metric.createdAt,
                    value: metric.activeConnections,
                })),
                tablesCount: sortedMetrics.map((metric) => ({
                    collectedAt: metric.createdAt,
                    value: metric.tablesCount,
                })),
            },
        };
    }
};
exports.GetDashboardConnectionMetricsChartUseCase = GetDashboardConnectionMetricsChartUseCase;
exports.GetDashboardConnectionMetricsChartUseCase = GetDashboardConnectionMetricsChartUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("DatabaseConnectionRepository")),
    __param(1, (0, common_1.Inject)("DatabaseMetricRepository")),
    __metadata("design:paramtypes", [Object, Object])
], GetDashboardConnectionMetricsChartUseCase);
//# sourceMappingURL=get-dashboard-connection-metrics-chart.use-case.js.map