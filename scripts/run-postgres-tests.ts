import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { PostgreSqlContainer } from "@testcontainers/postgresql";

type Suite = "integration" | "e2e";

const suite = process.argv[2] as Suite | undefined;
const testFiles: Record<Suite, string[]> = {
  integration: ["test/integration/public-registration.integration.test.ts"],
  e2e: ["test/e2e/auth.e2e.test.ts"],
};

function runPnpm(args: string[], env: NodeJS.ProcessEnv): number {
  const pnpmEntrypoint = process.env.npm_execpath;
  if (!pnpmEntrypoint) {
    throw new Error("Run this script through pnpm so its executable is available");
  }

  const result = spawnSync(process.execPath, [pnpmEntrypoint, ...args], {
    cwd: process.cwd(),
    env,
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  if (result.error) {
    throw new Error(`Could not execute pnpm: ${result.error.message}`);
  }

  return result.status ?? 1;
}

async function run(): Promise<void> {
  if (!suite || !(suite in testFiles)) {
    throw new Error("Select either the integration or e2e suite");
  }

  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>> | undefined;
  let exitCode = 1;

  try {
    const suffix = randomBytes(8).toString("hex");
    container = await new PostgreSqlContainer("postgres:16-alpine")
      .withDatabase(`dbmetrics_test_${suffix}`)
      .withUsername(`dbmetrics_${suffix}`)
      .withPassword(randomBytes(32).toString("base64url"))
      .start();

    const testEnvironment: NodeJS.ProcessEnv = {
      ...process.env,
      DATABASE_URL: container.getConnectionUri(),
      NODE_ENV: "test",
      JWT_SECRET: randomBytes(48).toString("base64url"),
      DATABASE_CREDENTIALS_KEY: randomBytes(32).toString("base64"),
      PUBLIC_REGISTRATION_ENABLED: "false",
      CORS_ORIGIN: "http://localhost:3000",
      LOG_LEVEL: "info",
      EMAIL_PROVIDER: "",
      RESEND_API_KEY: "",
      EMAIL_FROM: "",
      PUBLIC_WEB_URL: "http://localhost:3000",
      APP_READINESS_TIMEOUT_MS: "2000",
      REFRESH_TOKEN_TTL_DAYS: "30",
      DATABASE_METRICS_SCHEDULER_ENABLED: "false",
    };

    if (suite === "e2e") {
      const buildExitCode = runPnpm(
        ["exec", "nest", "build"],
        testEnvironment,
      );
      if (buildExitCode !== 0) {
        throw new Error(`Nest compilation failed with exit code ${buildExitCode}`);
      }
    }

    const generateExitCode = runPnpm(
      ["exec", "prisma", "generate"],
      testEnvironment,
    );
    if (generateExitCode !== 0) {
      throw new Error(`Prisma client generation failed with exit code ${generateExitCode}`);
    }

    const migrateExitCode = runPnpm(
      ["exec", "prisma", "migrate", "deploy"],
      testEnvironment,
    );
    if (migrateExitCode !== 0) {
      throw new Error(`Prisma migrations failed with exit code ${migrateExitCode}`);
    }

    exitCode = runPnpm(
      ["exec", "tsx", "--test", ...testFiles[suite]],
      testEnvironment,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PostgreSQL test runner failed";
    const connectionUri = container?.getConnectionUri();
    process.stderr.write(
      `${connectionUri ? message.replaceAll(connectionUri, "[temporary test database URL]") : message}\n`,
    );
  } finally {
    if (container) {
      try {
        await container.stop();
      } catch (error) {
        process.stderr.write("Failed to stop the temporary PostgreSQL container.\n");
        if (exitCode === 0) {
          exitCode = 1;
        }
      }
    }
  }

  process.exitCode = exitCode;
}

void run();
