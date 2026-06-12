"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaDatabaseMetricRepository = void 0;
const prisma_client_1 = require("../../../user/infra/database/prisma/prisma-client");
class PrismaDatabaseMetricRepository {
    async save(metric) {
        await prisma_client_1.prisma.databaseMetric.create({
            data: {
                id: metric.id,
                databaseConnectionId: metric.databaseConnectionId,
                databaseVersion: metric.databaseVersion,
                tablesCount: metric.tablesCount,
                databaseSize: metric.databaseSize,
                activeConnections: metric.activeConnections,
                createdAt: metric.createdAt,
            },
        });
    }
}
exports.PrismaDatabaseMetricRepository = PrismaDatabaseMetricRepository;
//# sourceMappingURL=prisma-database-metric.repository.js.map