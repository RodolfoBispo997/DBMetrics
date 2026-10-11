import { ServiceUnavailableException } from "@nestjs/common";
import {
  EmailConfirmationMessage,
  EmailConfirmationSender,
} from "../../application/use-cases/public-registration/email-confirmation-sender";
import { buildEmailConfirmationUrl } from "./email-confirmation-url";
import { redactSensitiveText } from "../../../shared/observability/structured-logging";

export type ResendEmailClient = {
  emails: {
    send(message: {
      from: string;
      to: string;
      subject: string;
      html: string;
      text: string;
    }): Promise<{ error: unknown | null }>;
  };
};

export class ResendEmailConfirmationSender implements EmailConfirmationSender {

  constructor(
    private readonly resend: ResendEmailClient,
    private readonly from: string,
    private readonly publicWebUrl: string,
  ) {}

  async send(message: EmailConfirmationMessage): Promise<void> {
    const confirmationUrl = buildEmailConfirmationUrl(
      this.publicWebUrl,
      message.token,
    );
    const escapedName = escapeHtml(message.name);
    const escapedUrl = escapeHtml(confirmationUrl);

    try {
      console.info({
        provider: "resend",
        from: this.from,
        to: maskEmail(message.email),
        status: "sending",
      });
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: message.email,
        subject: "Confirm your DBMetrics email",
        html: `<p>Hello ${escapedName},</p><p>Confirm your email address by visiting <a href="${escapedUrl}">this link</a>.</p><p>This link expires in 24 hours.</p>`,
        text: `Hello ${message.name},\n\nConfirm your email address by visiting this link:\n${confirmationUrl}\n\nThis link expires in 24 hours.`,
      });

      if (error) {
        console.error({
          provider: "resend",
          from: this.from,
          to: maskEmail(message.email),
          status: "error",
          error: safeProviderError(error, message.token),
        });
        throw new Error("Email provider rejected the confirmation email");
      }

      console.info({
        provider: "resend",
        from: this.from,
        to: maskEmail(message.email),
        status: "success",
      });
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "Email provider rejected the confirmation email") {
        console.error({
          provider: "resend",
          from: this.from,
          to: maskEmail(message.email),
          status: "error",
          error: safeProviderError(error, message.token),
        });
      }
      throw new ServiceUnavailableException(
        "Email confirmation could not be sent. Please try again later.",
      );
    }
  }
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@", 2);
  if (!domain) return "[invalid-email]";
  const visible = localPart.length > 2 ? localPart.slice(0, 2) : localPart.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(1, localPart.length - visible.length))}@${domain}`;
}

function safeProviderError(
  error: unknown,
  confirmationToken: string,
): { code?: string; message: string } {
  if (!(error instanceof Error)) return { message: "Unknown provider error" };
  const safeMessage = redactSensitiveText(error.message)
    .replaceAll(confirmationToken, "[REDACTED]")
    .replace(/\b(?:re|resend)[-_ ]?(?:api[-_ ]?)?key\b\s*[:=]?\s*[^\s,;]*/gi, "[REDACTED]")
    .replace(/\b[A-Za-z0-9_-]{20,}\b/g, "[REDACTED]")
    .slice(0, 300);
  return {
    ...(typeof (error as Error & { code?: unknown }).code === "string"
      ? { code: (error as Error & { code: string }).code }
      : {}),
    message: safeMessage,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}
