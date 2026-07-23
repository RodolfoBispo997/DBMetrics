import mysql from "mysql2/promise";

import { DatabaseMetricCollector } from "../../../application/services/database-metric/database-metric-collector";
import { DatabaseConnection } from "../../../domain/entities/database-connection";
import { DatabaseMetricData } from "../../../application/types/database-metric-data.type";
import { getEnvironmentConfig } from "../../../../shared/config/environment.config";

export class MysqlMetricCollector implements DatabaseMetricCollector {
  async collect(connection: DatabaseConnection): Promise<DatabaseMetricData> {
    const timeoutMs =
      getEnvironmentConfig().scheduler.databaseMetrics.connectionTimeoutMs;
    const client = await mysql.createConnection({
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.username,
      password: connection.password,
      connectTimeout: timeoutMs,
    });
    const queryOptions = { timeout: timeoutMs };

    try {
      const [versionRows] = await client.query({
        sql: `
        SELECT VERSION() AS version
        `,
        ...queryOptions,
      });

      const [tablesRows] = await client.query({
        sql: `
        SELECT COUNT(*) AS count
        FROM information_schema.tables
        WHERE table_schema = ?
          AND table_type = 'BASE TABLE'
        `,
        values: [connection.database],
        ...queryOptions,
      });

      const [viewsRows] = await client.query({
        sql: `
        SELECT COUNT(*) AS count
        FROM information_schema.views
        WHERE table_schema = ?
        `,
        values: [connection.database],
        ...queryOptions,
      });

      const [schemasRows] = await client.query({
        sql: `
        SELECT COUNT(*) AS count
        FROM information_schema.schemata
        WHERE schema_name NOT LIKE 'pg_%'
        AND schema_name <> 'information_schema'
        `,
        ...queryOptions,
      });

      const [indexesRows] = await client.query({
        sql: `
        SELECT COUNT(DISTINCT index_name) AS count
        FROM information_schema.statistics
        WHERE table_schema = ?
        `,
        values: [connection.database],
        ...queryOptions,
      });

      const [functionsRows] = await client.query({
        sql: `
        SELECT COUNT(*) AS count
        FROM information_schema.routines
        WHERE routine_schema = ?
          AND routine_type = 'FUNCTION'
        `,
        values: [connection.database],
        ...queryOptions,
      });

      const [sizeRows] = await client.query({
        sql: `
        SELECT COALESCE(SUM(data_length + index_length), 0) AS size
        FROM information_schema.tables
        WHERE table_schema = ?
        `,
        values: [connection.database],
        ...queryOptions,
      });

      const [connectionsRows] = await client.query({
        sql: `
        SELECT COUNT(*) AS count
        FROM information_schema.processlist
        `,
        ...queryOptions,
      });

      return {
        databaseVersion: (versionRows as any[])[0].version,

        tablesCount: Number((tablesRows as any[])[0].count),
        viewsCount: Number((viewsRows as any[])[0].count),
        schemasCount: Number((schemasRows as any[])[0].count),
        indexesCount: Number((indexesRows as any[])[0].count),
        functionsCount: Number((functionsRows as any[])[0].count),

        databaseSize: Number((sizeRows as any[])[0].size),
        activeConnections: Number((connectionsRows as any[])[0].count),
      };
    } finally {
      await client.end();
    }
  }
}
