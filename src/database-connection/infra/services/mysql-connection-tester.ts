import mysql from "mysql2/promise";
import { DatabaseConnection } from "../../domain/entities/database-connection";
import { DatabaseConnectionTester } from "../../application/services/database-connection-tester";

export class MysqlConnectionTester implements DatabaseConnectionTester {
  async test(
    connection: DatabaseConnection,
  ): Promise<{ success: boolean; message: string }> {
    let client: mysql.Connection | undefined;

    try {
      client = await mysql.createConnection({
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
    } catch (error) {
      await client?.end().catch(() => undefined);

      return {
        success: false,
        message: this.translateError(error),
      };
    }
  }

  private translateError(error: any): string {
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
