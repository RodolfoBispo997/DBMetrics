"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaDatabaseMetricRepository = void 0;
const database_metric_1 = require("../../domain/entities/database-metric");
const prisma_client_1 = require("../../../user/infra/database/prisma/prisma-client");
class PrismaDatabaseMetricRepository {
    async findByConnectionId(connectionId) {
        const connection = await prisma_client_1.prisma.databaseMetric.findMany({
            where: {
                databaseConnectionId: connectionId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return connection.map((connection) => database_metric_1.DatabaseMetrics.restore({
            id: connection.id,
            databaseConnectionId: connection.databaseConnectionId,
            databaseVersion: connection.databaseVersion,
            tablesCount: connection.tablesCount,
            databaseSize: connection.databaseSize,
            activeConnections: connection.activeConnections,
            createdAt: connection.createdAt,
        }));
    }
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