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
};

let environmentConfig: EnvironmentConfig | undefined;

export function getEnvironmentConfig(): EnvironmentConfig {
  if (environmentConfig) {
    return environmentConfig;
  }

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
  };

  return environmentConfig;
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
