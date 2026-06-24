"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresMetricCollector = void 0;
const pg_1 = require("pg");
class PostgresMetricCollector {
    async collect(connection) {
        const client = new pg_1.Client({
            host: connection.host,
            port: connection.port,
            database: connection.database,
            user: connection.username,
            password: connection.password,
        });
        await client.connect();
        try {
            const versionResult = await client.query("SELECT version()");
            const tablesResult = await client.query(`
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = 'public'
        `);
            const sizeResult = await client.query(`
        SELECT pg_database_size(current_database())
        `);
            const connectionsResult = await client.query(`
        SELECT COUNT(*)
        FROM pg_stat_activity
        `);
            return {
                databaseVersion: versionResult.rows[0].version,
                tablesCount: Number(tablesResult.rows[0].count),
                databaseSize: Number(sizeResult.rows[0].pg_database_size),
                activeConnections: Number(connectionsResult.rows[0].count),
            };
        }
        finally {
            await client.end();
        }
    }
}
exports.PostgresMetricCollector = PostgresMetricCollector;
//# sourceMappingURL=postgres-metric-collector.js.map