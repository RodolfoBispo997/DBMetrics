import { Inject, Optional } from "@nestjs/common";
import mysql from "mysql2/promise";
import { Socket } from "node:net";
import { DatabaseConnection } from "../../domain/entities/database-connection";
import { DatabaseConnectionTester } from "../../application/services/database-connection-tester";
import { getEnvironmentConfig } from "../../../shared/config/environment.config";
import {
  connectMysqlToValidatedAddress,
  DatabaseConnectionTestProbe,
  DatabaseHostResolver,
  DatabaseConnectionTimeoutError,
  resolveDatabaseHost,
  runWithConnectionTimeout,
  getMysqlTlsOptions,
} from "./database-host-security";

const MYSQL_PROBE_FACTORY = "MYSQL_DATABASE_CONNECTION_PROBE_FACTORY";
const MYSQL_HOST_RESOLVER = "MYSQL_DATABASE_HOST_RESOLVER";
type MysqlProbeFactory = (connection: DatabaseConnection) => DatabaseConnectionTestProbe;

export class MysqlConnectionTester implements DatabaseConnectionTester {
  constructor(
    @Optional() @Inject(MYSQL_PROBE_FACTORY)
    private readonly injectedProbeFactory?: MysqlProbeFactory,
    @Optional() @Inject(MYSQL_HOST_RESOLVER)
    private readonly injectedHostResolver?: DatabaseHostResolver,
  ) {}

  async test(
    connection: DatabaseConnection,
  ): Promise<{ success: boolean; message: string }> {
    const timeoutMs = getEnvironmentConfig().scheduler.databaseMetrics.connectionTimeoutMs;
    const probe = (this.injectedProbeFactory ?? ((value) =>
      createMysqlProbe(value, this.injectedHostResolver)))(connection);
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
          : translateMysqlError(error),
      };
    }
  }
}

function createMysqlProbe(
  connection: DatabaseConnection,
  hostResolver?: DatabaseHostResolver,
): DatabaseConnectionTestProbe {
  const socket = new Socket();
  let client: mysql.Connection | undefined;
  let cancelled = false;
  return {
    run: async () => {
      const timeoutMs = getEnvironmentConfig().scheduler.databaseMetrics.connectionTimeoutMs;
      const resolved = await (hostResolver ?? resolveDatabaseHost)(connection.host);
      if (cancelled) throw new DatabaseConnectionTimeoutError();
      const stream = await connectMysqlToValidatedAddress(
        resolved.addresses[0], connection.port, timeoutMs, socket,
      );
      if (cancelled) throw new DatabaseConnectionTimeoutError();
      client = await mysql.createConnection({
        // Keep the submitted hostname for TLS SNI/identity checks while the
        // supplied connected socket pins TCP to the validated address.
        host: resolved.hostname,
        stream,
        ssl: getMysqlTlsOptions(
          process.env.NODE_ENV,
          getEnvironmentConfig().mysql.tlsCa,
        ),
        port: connection.port,
        database: connection.database,
        user: connection.username,
        password: connection.password,
        connectTimeout: timeoutMs,
      });
      await client.query({ sql: "SELECT 1", timeout: timeoutMs });
      await client.end();
    },
    cancel: () => {
      cancelled = true;
      client?.destroy();
      socket.destroy();
    },
  };
}

function translateMysqlError(error: any): string {
  switch (error?.code) {
    case "ECONNREFUSED": return "Connection refused";
    case "ETIMEDOUT": return "Connection test timed out";
    case "ENOTFOUND": return "Host not found";
    case "ER_ACCESS_DENIED_ERROR": return "Invalid username or password";
    case "ER_BAD_DB_ERROR": return "Database does not exist";
    case "PROTOCOL_CONNECTION_LOST": return "Connection lost";
    default: return "Connection test failed";
  }
}
