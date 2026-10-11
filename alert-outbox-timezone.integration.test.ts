import assert from "node:assert/strict";
import { realpathSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test, { after, before } from "node:test";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Pool } from "pg";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "timezone-integration-secret";
process.env.DATABASE_CREDENTIALS_KEY =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
process.env.PUBLIC_REGISTRATION_ENABLED = "false";

import { AlertExecution } from "./src/alerts/domain/entities/alert-execution";
import { AlertOutboxEvent } from "./src/alerts/domain/entities/alert-outbox-event";
import { AlertMetric } from "./src/alerts/domain/enums/alert-metric.enum";
import { AlertOperator } from "./src/alerts/domain/enums/alert-operator.enum";
import { NotificationChannel } from "./src/alerts/domain/enums/notification-channel.enum";
import { PrismaAlertExecutionRepository } from "./src/alerts/infra/repositories/prisma-alert-execution.repository";
import { PrismaAlertOutboxRepository } from "./src/alerts/infra/repositories/prisma-alert-outbox.repository";
import { PrismaService } from "./src/shared/infra/database/prisma/prisma.service";

let postgres: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
let prisma: PrismaService;

before(async () => {
  postgres = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("dbmetrics_outbox_timezone")
    .withUsername("dbmetrics")
    .withPassword("dbmetrics-password")
    .start();
  process.env.DATABASE_URL = postgres.getConnectionUri();

  const npmExecPath = process.env.npm_execpath;
  const prismaCli = join(
    realpathSync(join(process.cwd(), "node_modules", "prisma")),
    "build",
    "index.js",
  );
  const migration = spawnSync(
    process.execPath,
    npmExecPath
      ? [npmExecPath, "exec", "prisma", "migrate", "deploy"]
      : [prismaCli, "migrate", "deploy"],
    { cwd: process.cwd(), env: process.env, encoding: "utf8", windowsHide: true },
  );
  if (migration.status !== 0) {
    throw new Error(
      (migration.stderr || migration.stdout || "Prisma migration failed").replaceAll(
        postgres.getConnectionUri(),
        "[temporary test database URL]",
      ),
    );
  }

  prisma = new PrismaService();
  await prisma.$connect();
});

after(async () => {
  await prisma?.$disconnect();
  await postgres?.stop();
});

test("new outbox remains immediately eligible across PostgreSQL session time zones", async () => {
  const user = await prisma.user.create({
    data: {
      name: "Timezone Test",
      email: `timezone-${Date.now()}@example.com`,
      password: "test-hash",
    },
  });
  const connection = await prisma.databaseConnection.create({
    data: {
      name: "timezone-test-connection",
      provider: "POSTGRESQL",
      host: "localhost",
      port: 5432,
      database: "dbmetrics",
      username: "test",
      password: "test-only",
      userId: user.id,
    },
  });
  const metric = await prisma.databaseMetric.create({
    data: {
      databaseConnectionId: connection.id,
      databaseVersion: "16",
      tablesCount: 1,
      viewsCount: 0,
      schemasCount: 1,
      indexesCount: 0,
      functionsCount: 0,
      databaseSize: 1,
      activeConnections: 1,
    },
  });
  const rule = await prisma.alertRule.create({
    data: {
      metric: AlertMetric.DATABASE_SIZE,
      operator: AlertOperator.GREATER_THAN,
      threshold: 0,
      channel: NotificationChannel.EMAIL,
      destination: "timezone-test@example.com",
      databaseConnectionId: connection.id,
    },
  });
  const execution = AlertExecution.create({
    alertRuleId: rule.id,
    databaseMetricId: metric.id,
    databaseConnectionId: connection.id,
    connectionName: connection.name,
    databaseProvider: connection.provider,
    host: connection.host,
    databaseName: connection.database,
    port: connection.port,
    metric: rule.metric,
    operator: rule.operator,
    metricValue: 1,
    threshold: 0,
    channel: rule.channel,
    destination: rule.destination,
  });
  const event = AlertOutboxEvent.create(
    {
      alertExecutionId: execution.id,
      channel: execution.channel,
      destination: execution.destination,
      executedAt: execution.triggeredAt.toISOString(),
    },
    execution.id,
    execution.id,
  );

  assert.equal(
    await new PrismaAlertExecutionRepository(prisma).saveIfNotificationEligible(
      execution,
      event,
    ),
    true,
  );

  const writerSession = await prisma.$queryRaw<Array<{ timeZone: string }>>`
    SELECT current_setting('TimeZone') AS "timeZone"
  `;
  const comparisonZones = ["Pacific/Honolulu", "Asia/Tokyo"];
  assert.ok(
    comparisonZones.some((timeZone) => timeZone !== writerSession[0].timeZone),
    "the dispatcher comparison must use a time zone different from the writer",
  );

  for (const timeZone of comparisonZones) {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT set_config('TimeZone', ${timeZone}, true)`;
      return tx.$queryRaw<
        Array<{
          eligible: boolean;
          columnType: string;
          availableEpoch: number;
          nowEpoch: number;
        }>
      >`SELECT "availableAt" <= NOW() AS eligible,
                pg_typeof("availableAt")::text AS "columnType",
                extract(epoch FROM "availableAt") AS "availableEpoch",
                extract(epoch FROM NOW()) AS "nowEpoch"
          FROM "alert_outbox_events"
          WHERE "alertExecutionId" = ${execution.id}`;
    });

    assert.equal(result[0]?.columnType, "timestamp with time zone");
    assert.equal(
      result[0]?.eligible,
      true,
      `outbox must be eligible in ${timeZone}: ${JSON.stringify(result[0])}`,
    );
  }

  const claimed = await new PrismaAlertOutboxRepository(prisma).claimNextReady(10);
  assert.ok(
    claimed.some((candidate) => candidate.id === event.id),
    "the dispatcher's actual ready query must claim the new outbox",
  );
});

test("migration interprets legacy naive outbox timestamps as UTC instants", async () => {
  const pool = new Pool({ connectionString: postgres.getConnectionUri() });
  const client = await pool.connect();
  try {
    await client.query("CREATE SCHEMA legacy_outbox_test");
    await client.query("SET search_path TO legacy_outbox_test");
    await client.query(`
      CREATE TABLE alert_outbox_events (
        "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "publishedAt" TIMESTAMP(3),
        "claimedAt" TIMESTAMP(3),
        "claimExpiresAt" TIMESTAMP(3),
        "failedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `);
    await client.query(`
      INSERT INTO alert_outbox_events (
        "availableAt", "publishedAt", "claimedAt", "claimExpiresAt",
        "failedAt", "createdAt", "updatedAt"
      ) VALUES (
        '2026-10-10 22:52:00.655', '2026-10-10 22:53:00.000', NULL,
        NULL, NULL, '2026-10-10 22:52:00.647', '2026-10-10 22:52:00.647'
      )
    `);

    const migration = await readFile(
      join(
        process.cwd(),
        "prisma",
        "migrations",
        "20261010100000_alert_outbox_timestamptz",
        "migration.sql",
      ),
      "utf8",
    );
    await client.query(migration);
    const result = await client.query(`
      SELECT
        extract(epoch FROM "availableAt") AS available_epoch,
        extract(epoch FROM "publishedAt") AS published_epoch,
        pg_typeof("availableAt")::text AS column_type
      FROM alert_outbox_events
    `);

    assert.equal(result.rows[0].column_type, "timestamp with time zone");
    assert.equal(
      Number(result.rows[0].available_epoch),
      Date.parse("2026-10-10T22:52:00.655Z") / 1000,
    );
    assert.equal(
      Number(result.rows[0].published_epoch),
      Date.parse("2026-10-10T22:53:00.000Z") / 1000,
    );
  } finally {
    client.release();
    await pool.end();
  }
});
