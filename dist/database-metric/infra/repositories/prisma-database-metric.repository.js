"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaDatabaseMetricRepository = void 0;
const database_metric_1 = require("../../domain/entities/database-metric");
const prisma_client_1 = require("../../../user/infra/database/prisma/prisma-client");
class PrismaDatabaseMetricRepository {
    async findByConnectionId(connectionId) {
        const metrics = await prisma_client_1.prisma.databaseMetric.findMany({
            where: {
                databaseConnectionId: connectionId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return metrics.map((metric) => database_metric_1.DatabaseMetrics.restore({
            id: metric.id,
            databaseConnectionId: metric.databaseConnectionId,
            databaseVersion: metric.databaseVersion,
            tablesCount: metric.tablesCount,
            viewsCount: metric.viewsCount,
            schemasCount: metric.schemasCount,
            indexesCount: metric.indexesCount,
            functionsCount: metric.functionsCount,
            databaseSize: metric.databaseSize,
            activeConnections: metric.activeConnections,
            createdAt: metric.createdAt,
        }));
    }
    async findHistoryByConnectionId(data) {
        const metrics = await prisma_client_1.prisma.databaseMetric.findMany({
            where: {
                databaseConnectionId: data.connectionId,
                createdAt: {
                    gte: data.startDate,
                    lte: data.endDate,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return metrics.map((metric) => database_metric_1.DatabaseMetrics.restore({
            id: metric.id,
            databaseConnectionId: metric.databaseConnectionId,
            databaseVersion: metric.databaseVersion,
            tablesCount: metric.tablesCount,
            viewsCount: metric.viewsCount,
            schemasCount: metric.schemasCount,
            indexesCount: metric.indexesCount,
            functionsCount: metric.functionsCount,
            databaseSize: metric.databaseSize,
            activeConnections: metric.activeConnections,
            createdAt: metric.createdAt,
        }));
    }
    async findLatestByConnectionId(connectionId) {
        const metric = await prisma_client_1.prisma.databaseMetric.findFirst({
            where: {
                databaseConnectionId: connectionId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        if (!metric) {
            return null;
        }
        return database_metric_1.DatabaseMetrics.restore({
            id: metric.id,
            databaseConnectionId: metric.databaseConnectionId,
            databaseVersion: metric.databaseVersion,
            tablesCount: metric.tablesCount,
            viewsCount: metric.viewsCount,
            schemasCount: metric.schemasCount,
            indexesCount: metric.indexesCount,
            functionsCount: metric.functionsCount,
            databaseSize: metric.databaseSize,
            activeConnections: metric.activeConnections,
            createdAt: metric.createdAt,
        });
    }
    async save(metric) {
        await prisma_client_1.prisma.databaseMetric.create({
            data: {
                id: metric.id,
                databaseConnectionId: metric.databaseConnectionId,
                databaseVersion: metric.databaseVersion,
                tablesCount: metric.tablesCount,
                viewsCount: metric.viewsCount,
                schemasCount: metric.schemasCount,
                indexesCount: metric.indexesCount,
                functionsCount: metric.functionsCount,
                databaseSize: metric.databaseSize,
                activeConnections: metric.activeConnections,
                createdAt: metric.createdAt,
            },
        });
    }
}
exports.PrismaDatabaseMetricRepository = PrismaDatabaseMetricRepository;
//# sourceMappingURL=prisma-database-metric.repository.js.map