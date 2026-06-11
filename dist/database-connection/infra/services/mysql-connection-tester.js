"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlConnectionTester = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
class MysqlConnectionTester {
    async test(connection) {
        let client;
        try {
            client = await promise_1.default.createConnection({
                host: connection.host,
                port: connection.port,
                database: connection.database,
                user: connection.username,
                password: connection.password,
            });
            await client.query("SELECT 1");
            await client.end();
            return {
                success: true,
                message: "Connection established successfully",
            };
        }
        catch (error) {
            await client?.end().catch(() => undefined);
            return {
                success: false,
                message: this.translateError(error),
            };
        }
    }
    translateError(error) {
        switch (error?.code) {
            case "ECONNREFUSED":
                return "Connection refused. Verify host, port, and database server status";
            case "ETIMEDOUT":
                return "Connection timeout";
            case "ENOTFOUND":
                return "Host not found";
            case "ER_ACCESS_DENIED_ERROR":
                return "Invalid username or password";
            case "ER_BAD_DB_ERROR":
                return "Database does not exist";
            case "PROTOCOL_CONNECTION_LOST":
                return "Connection lost";
            default:
                return error?.message || "Unknown error";
        }
    }
}
exports.MysqlConnectionTester = MysqlConnectionTester;
//# sourceMappingURL=mysql-connection-tester.js.map