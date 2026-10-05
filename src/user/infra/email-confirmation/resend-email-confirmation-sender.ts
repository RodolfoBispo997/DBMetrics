import { ServiceUnavailableException } from "@nestjs/common";
import {
  EmailConfirmationMessage,
  EmailConfirmationSender,
} from "../../application/use-cases/public-registration/email-confirmation-sender";
import { buildEmailConfirmationUrl } from "./email-confirmation-url";

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
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: message.email,
        subject: "Confirm your DBMetrics email",
        html: `<p>Hello ${escapedName},</p><p>Confirm your email address by visiting <a href="${escapedUrl}">this link</a>.</p><p>This link expires in 24 hours.</p>`,
        text: `Hello ${message.name},\n\nConfirm your email address by visiting this link:\n${confirmationUrl}\n\nThis link expires in 24 hours.`,
      });

      if (error) {
        throw new Error("Email provider rejected the confirmation email");
      }
    } catch {
      throw new ServiceUnavailableException(
        "Email confirmation could not be sent. Please try again later.",
      );
    }
  }
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
