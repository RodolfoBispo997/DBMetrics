import { Client } from "pg";
import { DatabaseMetricCollector } from "../../../application/services/database-metric/database-metric-collector";
import { DatabaseMetric } from "../../../application/types/database-metrics.type";
import { DatabaseConnection } from "../../../domain/entities/database-connection";

export class PostgresMetricCollector implements DatabaseMetricCollector {
  async collect(connection: DatabaseConnection): Promise<DatabaseMetric> {
    const client = new Client({
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.username,
      password: connection.password,
    });

    await client.connect();

    try {
      const versionResult = await client.query(`
        SELECT version()
      `);

      const tablesResult = await client.query(`
        SELECT COUNT(*) AS count
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
      `);

      const viewsResult = await client.query(`
        SELECT COUNT(*) AS count
        FROM information_schema.views
        WHERE table_schema = 'public'
      `);

      const schemasResult = await client.query(`
        SELECT COUNT(*) AS count
        FROM information_schema.schemata
        WHERE schema_name NOT IN (
          'information_schema',
          'pg_catalog',
          'pg_toast'
        )
      `);

      const indexesResult = await client.query(`
        SELECT COUNT(indexname)
        FROM pg_indexes
        WHERE schemaname='public'
      `);

      const functionsResult = await client.query(`
        SELECT COUNT(*) AS count
        FROM pg_proc p
        JOIN pg_namespace n
          ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
      `);

      const sizeResult = await client.query(`
        SELECT pg_database_size(current_database())
      `);

      const connectionsResult = await client.query(`
        SELECT COUNT(*) AS count
        FROM pg_stat_activity
      `);

      return {
        databaseVersion: versionResult.rows[0].version,

        tablesCount: Number(tablesResult.rows[0].count),
        viewsCount: Number(viewsResult.rows[0].count),
        schemasCount: Number(schemasResult.rows[0].count),
        indexesCount: Number(indexesResult.rows[0].count),
        functionsCount: Number(functionsResult.rows[0].count),

        databaseSize: Number(sizeResult.rows[0].pg_database_size),
        activeConnections: Number(connectionsResult.rows[0].count),
      };
    } finally {
      await client.end();
    }
  }
}
