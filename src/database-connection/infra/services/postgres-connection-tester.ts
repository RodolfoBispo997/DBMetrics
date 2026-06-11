import { Client } from "pg";
import { DatabaseConnectionTester } from "../../application/services/database-connection-tester";
import { DatabaseConnection } from "../../domain/entities/database-connection";

export class PostgresConnectionTester implements DatabaseConnectionTester {
  async test(
    connection: DatabaseConnection,
  ): Promise<{ success: boolean; message: string }> {
    const client = new Client({
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
    } catch (error) {
      console.error("VERIFICAR ERROR ===>", error);
      await client.end().catch(() => undefined);

      return {
        success: false,
        message: this.translateError(error),
      };
    }
  }

  private translateError(error: any): string {
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
