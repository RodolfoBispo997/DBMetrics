import mysql from "mysql2/promise";

import { DatabaseMetricCollector } from "../../../application/services/database-metric/database-metric-collector";
import { DatabaseMetric } from "../../../application/types/database-metrics.type";
import { DatabaseConnection } from "../../../domain/entities/database-connection";

export class MysqlMetricCollector implements DatabaseMetricCollector {
  async collect(connection: DatabaseConnection): Promise<DatabaseMetric> {
    const client = await mysql.createConnection({
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.username,
      password: connection.password,
    });

    try {
      const [versionRows] = await client.query("SELECT VERSION() AS version");

      const [tablesRows] = await client.query(
        `
        SELECT COUNT(*) AS count
        FROM information_schema.tables
        WHERE table_schema = ?
        `,
        [connection.database],
      );

      const [sizeRows] = await client.query(
        `
        SELECT
          COALESCE(SUM(data_length + index_length), 0) AS size
        FROM information_schema.tables
        WHERE table_schema = ?
        `,
        [connection.database],
      );

      const [connectionsRows] = await client.query(
        `
        SELECT COUNT(*) AS count
        FROM information_schema.processlist
        `,
      );
      return {
        databaseVersion: (versionRows as any[])[0].version,
        tablesCount: Number((tablesRows as any[])[0].count),
        databaseSize: Number((sizeRows as any[])[0].size),
        activeConnections: Number((connectionsRows as any[])[0].count),
      };
    } finally {
      await client.end();
    }
  }
}
