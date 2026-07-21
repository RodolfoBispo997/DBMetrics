export type EnvironmentConfig = {
  jwtSecret: string;
  databaseCredentialsKey: Buffer;
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
