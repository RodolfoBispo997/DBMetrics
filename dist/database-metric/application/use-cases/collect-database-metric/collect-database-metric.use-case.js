"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectDatabaseMetricUseCase = void 0;
const database_connection_not_found_error_1 = require("../../../../database-connection/domain/errors/database-connection-not-found-error");
const database_metric_1 = require("../../../domain/entities/database-metric");
class CollectDatabaseMetricUseCase {
    constructor(databaseMetricRepository, databaseConnectionRepository, databaseMetricCollectorFactory) {
        this.databaseMetricRepository = databaseMetricRepository;
        this.databaseConnectionRepository = databaseConnectionRepository;
        this.databaseMetricCollectorFactory = databaseMetricCollectorFactory;
    }
    async execute(data) {
        const connection = await this.databaseConnectionRepository.findById(data.connectionId);
        if (!connection) {
            throw new database_connection_not_found_error_1.DatabaseConnectionNotFoundError("Database connection not found");
        }
        if (connection.userId !== data.userId) {
            throw new database_connection_not_found_error_1.DatabaseConnectionNotFoundError("Database connection not found");
        }
        const collet = this.databaseMetricCollectorFactory.get(connection.provider);
        const result = await collet.collect(connection);
        const databaseMetrics = database_metric_1.DatabaseMetrics.create({
            databaseConnectionId: connection.id,
            databaseVersion: result.databaseVersion,
            tablesCount: result.tablesCount,
            databaseSize: result.databaseSize,
            activeConnections: result.activeConnections,
        });
        await this.databaseMetricRepository.save(databaseMetrics);
    }
}
exports.CollectDatabaseMetricUseCase = CollectDatabaseMetricUseCase;
//# sourceMappingURL=collect-database-metric.use-case.js.map