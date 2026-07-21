export type EnvironmentConfig = {
  jwtSecret: string;
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

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
