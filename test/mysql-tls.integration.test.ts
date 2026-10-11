import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { DatabaseConnection } from "../src/database-connection/domain/entities/database-connection";
import { DatabaseProvider } from "../src/database-connection/domain/enums/database-provider.enum";
import { MysqlConnectionTester } from "../src/database-connection/infra/services/mysql-connection-tester";
import { MysqlMetricCollector } from "../src/database-connection/infra/services/database-metric/mysql-metric-collector";
import { getEnvironmentConfig } from "../src/shared/config/environment.config";

const password = "dbmetricstlsrootpass";

function runDocker(args: string[]): string {
  return execFileSync("docker", args, { encoding: "utf8" }).trim();
}

function connection(host: string) {
  return DatabaseConnection.restore({
    id: "00000000-0000-4000-8000-000000000003",
    name: "tls-test",
    provider: DatabaseProvider.MYSQL,
    host,
    port: Number(process.env.MYSQL_TLS_TEST_PORT),
    database: "test",
    username: "root",
    password,
    userId: "00000000-0000-4000-8000-000000000001",
  });
}

test("real MySQL tester and collector require verified TLS", { timeout: 120_000 }, async () => {
  const container = runDocker([
    "run", "--rm", "-d", "-e", `MYSQL_ROOT_PASSWORD=${password}`,
    "-p", "127.0.0.1::3306", "mysql:8.4",
  ]);
  try {
    const port = runDocker(["port", container, "3306/tcp"]).match(/:(\d+)$/)?.[1];
    assert.ok(port);
    process.env.MYSQL_TLS_TEST_PORT = port;

    for (let attempt = 0; attempt < 120; attempt++) {
      try {
        runDocker([
          "exec", container, "mysqladmin", "ping", "-h127.0.0.1", "-P3306",
          "-uroot", `-p${password}`,
        ]);
        break;
      } catch {
        if (attempt === 119) throw new Error("MySQL TLS integration container did not become ready");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    runDocker([
      "exec", container, "mysql", "-h127.0.0.1", "-P3306", "-uroot",
      `-p${password}`, "-e", "CREATE DATABASE test",
    ]);

    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "mysql-tls-integration-secret";
    process.env.DATABASE_CREDENTIALS_KEY = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    process.env.DATABASE_METRICS_CONNECTION_TIMEOUT_MS = "5000";
    process.env.ALERT_ASYNC_DELIVERY_ENABLED = "false";
    process.env.MYSQL_TLS_CA = runDocker(["exec", container, "cat", "/var/lib/mysql/ca.pem"]);
    const tlsHostname = runDocker([
      "exec", container, "openssl", "x509", "-in", "/var/lib/mysql/server-cert.pem",
      "-noout", "-subject",
    ]).match(/CN=([^\r\n,]+)/)?.[1];
    assert.ok(tlsHostname);

    // Test-only resolver injection stands in for a public DNS answer while the
    // disposable server remains on loopback. Production always uses the real
    // SSRF resolver and has no this bypass.
    const resolver = async (hostname: string) => ({
      hostname,
      addresses: ["127.0.0.1"],
    });
    const tester = new MysqlConnectionTester(undefined, resolver);
    const collector = new MysqlMetricCollector(resolver);

    assert.deepEqual(await tester.test(connection(tlsHostname)), {
      success: true,
      message: "Connection established successfully",
    });
    const metrics = await collector.collect(connection(tlsHostname));
    assert.equal(typeof metrics.databaseVersion, "string");
    assert.equal(typeof metrics.tablesCount, "number");

    const badCa = process.env.MYSQL_TLS_CA;
    getEnvironmentConfig().mysql.tlsCa = "invalid-ca";
    assert.equal((await tester.test(connection(tlsHostname))).success, false);
    getEnvironmentConfig().mysql.tlsCa = badCa;
    assert.equal((await tester.test(connection("wrong-hostname.example"))).success, false);
    await assert.rejects(() => collector.collect(connection("wrong-hostname.example")));
  } finally {
    runDocker(["rm", "-f", container]);
  }
});
