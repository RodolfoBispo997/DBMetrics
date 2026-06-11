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
            const [versionRows] = await client.query("SELECT VERSION() AS version");
            const [tablesRows] = await client.query(`
        SELECT COUNT(*) AS count
        FROM information_schema.tables
        WHERE table_schema = ?
        `, [connection.database]);
            const [sizeRows] = await client.query(`
        SELECT
          COALESCE(SUM(data_length + index_length), 0) AS size
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