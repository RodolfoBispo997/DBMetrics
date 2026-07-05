"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresConnectionTester = void 0;
const pg_1 = require("pg");
class PostgresConnectionTester {
    async test(connection) {
        const client = new pg_1.Client({
            host: connection.host,
            port: connection.port,
            database: connection.database,
            user: connection.username,
            password: connection.password,
        });
        try {
            await client.connect();
            await client.query("SELECT 1");
            await client.end();
            return {
                success: true,
                message: "Connection established successfully",
            };
        }
        catch (error) {
            await client.end().catch(() => undefined);
            return {
                success: false,
                message: this.translateError(error),
            };
        }
    }
    translateError(error) {
        switch (error.code) {
            case "28P01":
                return "Invalid username or password";
            case "3D000":
                return "Database not found";
            case "ENOTFOUND":
                return "Host not found. Check the server address";
            case "ECONNREFUSED":
                return "Connection refused. Verify host, port, and database server status";
            default:
                return "Connection test failed";
        }
    }
}
exports.PostgresConnectionTester = PostgresConnectionTester;
//# sourceMappingURL=postgres-connection-tester.js.map