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
exports.GetDashboardOverviewUseCase = void 0;
const common_1 = require("@nestjs/common");
let GetDashboardOverviewUseCase = class GetDashboardOverviewUseCase {
    constructor(databaseConnectionRepository, databaseMetricRepository) {
        this.databaseConnectionRepository = databaseConnectionRepository;
        this.databaseMetricRepository = databaseMetricRepository;
    }
    async execute(data) {
        const connections = await this.databaseConnectionRepository.findManyByUserId(data.userId);
        const connectionOverviews = await Promise.all(connections.map(async (connection) => {
            const metrics = await this.databaseMetricRepository.findByConnectionId(connection.id);
            const lastMetric = metrics[0] ?? null;
            return {
                connectionId: connection.id,
                name: connection.name,
                provider: connection.provider,
                database: connection.database,
                lastMetric: lastMetric
                    ? {
                        databaseVersion: lastMetric.databaseVersion,
                        tablesCount: lastMetric.tablesCount,
                        databaseSize: lastMetric.databaseSize,
                        activeConnections: lastMetric.activeConnections,
                        collectedAt: lastMetric.createdAt,
                    }
                    : null,
            };
        }));
        const summary = connectionOverviews.reduce((acc, connection) => {
            if (!connection.lastMetric) {
                return acc;
            }
            acc.totalDatabaseSize += connection.lastMetric.databaseSize;
            acc.totalActiveConnections += connection.lastMetric.activeConnections;
            return acc;
        }, {
            totalConnections: connections.length,
            totalDatabaseSize: 0,
            totalActiveConnections: 0,
        });
        return {
            summary,
            connections: connectionOverviews,
        };
    }
};
exports.GetDashboardOverviewUseCase = GetDashboardOverviewUseCase;
exports.GetDashboardOverviewUseCase = GetDashboardOverviewUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("DatabaseConnectionRepository")),
    __param(1, (0, common_1.Inject)("DatabaseMetricRepository")),
    __metadata("design:paramtypes", [Object, Object])
], GetDashboardOverviewUseCase);
//# sourceMappingURL=get-dashboard-overview.use-case.js.map