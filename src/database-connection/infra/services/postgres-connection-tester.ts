import { Inject, Optional } from "@nestjs/common";
import { Client } from "pg";
import { DatabaseConnectionTester } from "../../application/services/database-connection-tester";
import { DatabaseConnection } from "../../domain/entities/database-connection";
import { getEnvironmentConfig } from "../../../shared/config/environment.config";
import {
  DatabaseConnectionTestProbe,
  DatabaseConnectionTimeoutError,
  resolveDatabaseHost,
  runWithConnectionTimeout,
} from "./database-host-security";

const POSTGRES_PROBE_FACTORY = "POSTGRES_DATABASE_CONNECTION_PROBE_FACTORY";
type PostgresProbeFactory = (connection: DatabaseConnection) => DatabaseConnectionTestProbe;

export class PostgresConnectionTester implements DatabaseConnectionTester {
  constructor(
    @Optional() @Inject(POSTGRES_PROBE_FACTORY)
    private readonly injectedProbeFactory?: PostgresProbeFactory,
  ) {}

  async test(
    connection: DatabaseConnection,
  ): Promise<{ success: boolean; message: string }> {
    const timeoutMs = getEnvironmentConfig().scheduler.databaseMetrics.connectionTimeoutMs;
    const probe = (this.injectedProbeFactory ?? createPostgresProbe)(connection);
    let cancelled = false;
    const cancel = () => {
      if (cancelled) return;
      cancelled = true;
      probe.cancel();
    };
    try {
      await runWithConnectionTimeout(() => probe.run(), timeoutMs, cancel);
      return { success: true, message: "Connection established successfully" };
    } catch (error) {
      cancel();
      return {
        success: false,
        message: error instanceof DatabaseConnectionTimeoutError
          ? "Connection test timed out"
          : translatePostgresError(error),
      };
    }
  }
}

function createPostgresProbe(connection: DatabaseConnection): DatabaseConnectionTestProbe {
  let client: Client | undefined;
  let cancelled = false;
  return {
    run: async () => {
      const timeoutMs = getEnvironmentConfig().scheduler.databaseMetrics.connectionTimeoutMs;
      const resolved = await resolveDatabaseHost(connection.host);
      if (cancelled) throw new DatabaseConnectionTimeoutError();
      client = new Client({
        // Connect directly to the validated IP. If TLS is configured, retain
        // the original hostname as ssl.servername for certificate checks.
        host: resolved.addresses[0],
        port: connection.port,
        database: connection.database,
        user: connection.username,
        password: connection.password,
        connectionTimeoutMillis: timeoutMs,
        query_timeout: timeoutMs,
      });
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
    },
    cancel: () => {
      cancelled = true;
      client?.connection.stream.destroy();
    },
  };
}

function translatePostgresError(error: any): string {
  switch (error?.code) {
    case "28P01": return "Invalid username or password";
    case "3D000": return "Database not found";
    case "ENOTFOUND": return "Host not found";
    case "ECONNREFUSED": return "Connection refused";
    default: return "Connection test failed";
  }
}
