import { Resend } from "resend";
import type { EnvironmentConfig } from "../shared/config/environment.config";
import type { EmailConfirmationSender } from "../user/application/use-cases/public-registration/email-confirmation-sender";
import { LocalEmailConfirmationSender } from "../user/infra/email-confirmation/local-email-confirmation-sender";
import { ResendEmailConfirmationSender } from "../user/infra/email-confirmation/resend-email-confirmation-sender";
import { UnconfiguredEmailConfirmationSender } from "../user/infra/email-confirmation/unconfigured-email-confirmation-sender";

export function createEmailConfirmationSender(
  config: EnvironmentConfig,
  options: {
    nodeEnvironment?: string;
    resendClient?: ConstructorParameters<typeof ResendEmailConfirmationSender>[0];
  } = {},
): EmailConfirmationSender {
  const nodeEnvironment = options.nodeEnvironment ?? process.env.NODE_ENV;
  const isDevelopmentOrTest =
    nodeEnvironment === "development" || nodeEnvironment === "test";

  if (!isDevelopmentOrTest && config.publicRegistrationEnabled) {
    if (
      config.email.provider !== "resend" ||
      !config.email.apiKey ||
      !config.email.from
    ) {
      throw new Error(
        "Public registration requires a complete Resend configuration outside development and test",
      );
    }
  }

  if (config.email.provider === "resend") {
    if (!config.email.apiKey || !config.email.from) {
      if (config.publicRegistrationEnabled) {
        throw new Error("Public registration requires a complete Resend configuration");
      }
      return new UnconfiguredEmailConfirmationSender();
    }

    return new ResendEmailConfirmationSender(
      options.resendClient ?? new Resend(config.email.apiKey),
      config.email.from,
      config.email.publicWebUrl,
    );
  }

  if (config.email.provider === "local" && isDevelopmentOrTest) {
    return new LocalEmailConfirmationSender(config.email.publicWebUrl);
  }

  if (!isDevelopmentOrTest && config.publicRegistrationEnabled) {
    throw new Error(
      "Public registration requires a complete Resend configuration outside development and test",
    );
  }

  return isDevelopmentOrTest
    ? new LocalEmailConfirmationSender(config.email.publicWebUrl)
    : new UnconfiguredEmailConfirmationSender();
}
