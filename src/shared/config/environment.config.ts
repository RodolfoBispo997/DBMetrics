import type { LevelWithSilent } from "pino";

export type EnvironmentConfig = {
  jwtSecret: string;
  databaseCredentialsKey: Buffer;
  scheduler: {
    databaseMetrics: {
      enabled: boolean;
      cron: string;
      connectionTimeoutMs: number;
    };
  };
  evolution: {
    baseUrl: string;
    apiKey: string;
    instance: string;
  };
  publicRegistrationEnabled: boolean;
  appReadinessTimeoutMs: number;
  refreshTokenTtlDays: number;
  email: {
    provider: "resend" | undefined;
    apiKey: string | undefined;
    from: string | undefined;
    publicWebUrl: string;
  };
};

const logLevels = new Set<LevelWithSilent>([
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
  "silent",
]);

let environmentConfig: EnvironmentConfig | undefined;

export function getEnvironmentConfig(): EnvironmentConfig {
  if (environmentConfig) {
    return environmentConfig;
  }

  const publicRegistrationEnabled = getPublicRegistrationEnabled();

  environmentConfig = {
    jwtSecret: getRequiredEnvironmentVariable("JWT_SECRET"),
    databaseCredentialsKey: getDatabaseCredentialsKey(),
    scheduler: {
      databaseMetrics: {
        enabled: getBooleanEnvironmentVariable(
          "DATABASE_METRICS_SCHEDULER_ENABLED",
          false,
        ),
        cron: getNonEmptyEnvironmentVariable(
          "DATABASE_METRICS_CRON",
          "0 */5 * * * *",
        ),
        connectionTimeoutMs: getPositiveIntegerEnvironmentVariable(
          "DATABASE_METRICS_CONNECTION_TIMEOUT_MS",
          10000,
        ),
      },
    },
    evolution: {
      baseUrl: process.env.EVOLUTION_API_URL ?? "",
      apiKey: process.env.EVOLUTION_API_KEY ?? "",
      // EVOLUTION_INSTANCE is retained temporarily for existing deployments.
      instance:
        process.env.EVOLUTION_INSTANCE_NAME ?? process.env.EVOLUTION_INSTANCE ?? "",
    },
    publicRegistrationEnabled,
    appReadinessTimeoutMs: getAppReadinessTimeoutMs(),
    refreshTokenTtlDays: getRefreshTokenTtlDays(),
    email: getEmailConfiguration(publicRegistrationEnabled),
  };

  return environmentConfig;
}

export function getPublicRegistrationEnabled(): boolean {
  const enabled = getBooleanEnvironmentVariable(
    "PUBLIC_REGISTRATION_ENABLED",
    false,
  );

  if (enabled) {
    getEmailConfiguration(true);
  }

  return enabled;
}

export function getAppReadinessTimeoutMs(): number {
  return getPositiveIntegerEnvironmentVariable(
    "APP_READINESS_TIMEOUT_MS",
    2000,
  );
}

export function getRefreshTokenTtlDays(): number {
  return getPositiveIntegerEnvironmentVariable("REFRESH_TOKEN_TTL_DAYS", 30);
}

export function getLogLevel(): LevelWithSilent {
  const value = process.env.LOG_LEVEL?.trim() || "info";
  if (!logLevels.has(value as LevelWithSilent)) {
    throw new Error(
      "LOG_LEVEL must be one of: trace, debug, info, warn, error, fatal, silent",
    );
  }
  return value as LevelWithSilent;
}

function getEmailConfiguration(
  registrationEnabled: boolean,
): EnvironmentConfig["email"] {
  const providerValue = process.env.EMAIL_PROVIDER?.trim();
  if (providerValue && providerValue !== "resend") {
    throw new Error('EMAIL_PROVIDER must be "resend"');
  }

  const apiKey = process.env.RESEND_API_KEY?.trim() || undefined;
  const from = process.env.EMAIL_FROM?.trim() || undefined;
  const configuredWebUrl = process.env.PUBLIC_WEB_URL?.trim() || undefined;
  const isProduction =
    process.env.NODE_ENV !== "development" &&
    process.env.NODE_ENV !== "test";

  if (registrationEnabled && isProduction) {
    const missingVariables = [
      !providerValue && "EMAIL_PROVIDER",
      !apiKey && "RESEND_API_KEY",
      !from && "EMAIL_FROM",
      !configuredWebUrl && "PUBLIC_WEB_URL",
    ].filter((value): value is string => Boolean(value));

    if (missingVariables.length > 0) {
      throw new Error(
        `Public registration requires a complete Resend configuration outside development and test. Configure: ${missingVariables.join(", ")}`,
      );
    }
  }

  const publicWebUrl = configuredWebUrl ?? "http://localhost:3000";
  let parsedWebUrl: URL;
  try {
    parsedWebUrl = new URL(publicWebUrl);
  } catch {
    throw new Error("PUBLIC_WEB_URL must be a valid absolute URL");
  }

  if (parsedWebUrl.protocol !== "http:" && parsedWebUrl.protocol !== "https:") {
    throw new Error("PUBLIC_WEB_URL must use http or https");
  }

  return {
    provider: providerValue === "resend" ? "resend" : undefined,
    apiKey,
    from,
    publicWebUrl: publicWebUrl.replace(/\/+$/, ""),
  };
}

export function getDatabaseCredentialsKey(): Buffer {
  return parseDatabaseCredentialsKey(
    getRequiredEnvironmentVariable("DATABASE_CREDENTIALS_KEY"),
  );
}

export function parseDatabaseCredentialsKey(value: string): Buffer {
  if (!/^[A-Za-z0-9+/]{43}=$/.test(value)) {
    throw new Error(
      "DATABASE_CREDENTIALS_KEY must be a canonical Base64 value encoding 32 bytes",
    );
  }

  const key = Buffer.from(value, "base64");

  if (key.length !== 32 || key.toString("base64") !== value) {
    throw new Error(
      "DATABASE_CREDENTIALS_KEY must be a canonical Base64 value encoding 32 bytes",
    );
  }

  return key;
}

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getBooleanEnvironmentVariable(
  name: string,
  defaultValue: boolean,
): boolean {
  const value = process.env[name];

  if (value === undefined) {
    return defaultValue;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`${name} must be either "true" or "false"`);
}

function getNonEmptyEnvironmentVariable(
  name: string,
  defaultValue: string,
): string {
  const value = (process.env[name] ?? defaultValue).trim();

  if (!value) {
    throw new Error(`${name} must not be empty`);
  }

  return value;
}

function getPositiveIntegerEnvironmentVariable(
  name: string,
  defaultValue: number,
): number {
  const value = process.env[name] ?? String(defaultValue);
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${name} must be an integer greater than zero`);
  }

  return parsedValue;
}
