"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlMetricCollector = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
class MysqlMetricCollector {
    async collect(connection) {
        const client = await promise_1.default.createConnection({
            host: connection.host,
            port: connection.port,
            database: connection.database,
            user: connection.username,
            password: connection.password,
        });
        try {
            const [versionRows] = await client.query(`
        SELECT VERSION() AS version
      `);
            const [tablesRows] = await client.query(`
        SELECT COUNT(*) AS count
        FROM information_schema.tables
        WHERE table_schema = ?
          AND table_type = 'BASE TABLE'
        `, [connection.database]);
            const [viewsRows] = await client.query(`
        SELECT COUNT(*) AS count
        FROM information_schema.views
        WHERE table_schema = ?
        `, [connection.database]);
            const [schemasRows] = await client.query(`
        SELECT COUNT(*) AS count
        FROM information_schema.schemata
        WHERE schema_name NOT LIKE 'pg_%'
        AND schema_name <> 'information_schema'
      `);
            const [indexesRows] = await client.query(`
        SELECT COUNT(DISTINCT index_name) AS count
        FROM information_schema.statistics
        WHERE table_schema = ?
        `, [connection.database]);
            const [functionsRows] = await client.query(`
        SELECT COUNT(*) AS count
        FROM information_schema.routines
        WHERE routine_schema = ?
          AND routine_type = 'FUNCTION'
        `, [connection.database]);
            const [sizeRows] = await client.query(`
        SELECT COALESCE(SUM(data_length + index_length), 0) AS size
        FROM information_schema.tables
        WHERE table_schema = ?
        `, [connection.database]);
            const [connectionsRows] = await client.query(`
        SELECT COUNT(*) AS count
        FROM information_schema.processlist
      `);
            return {
                databaseVersion: versionRows[0].version,
                tablesCount: Number(tablesRows[0].count),
                viewsCount: Number(viewsRows[0].count),
                schemasCount: Number(schemasRows[0].count),
                indexesCount: Number(indexesRows[0].count),
                functionsCount: Number(functionsRows[0].count),
                databaseSize: Number(sizeRows[0].size),
                activeConnections: Number(connectionsRows[0].count),
            };
        }
        finally {
            await client.end();
        }
    }
}
exports.MysqlMetricCollector = MysqlMetricCollector;
//# sourceMappingURL=mysql-metric-collector.js.map