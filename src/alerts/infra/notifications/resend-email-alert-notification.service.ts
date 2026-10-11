import { Injectable } from "@nestjs/common";
import { Resend } from "resend";

import { NotificationService } from "../../application/services/notification.service";
import { AlertExecution } from "../../domain/entities/alert-execution";
import { getEnvironmentConfig } from "../../../shared/config/environment.config";
import { redactSensitiveText } from "../../../shared/observability/structured-logging";

export type ResendAlertClient = {
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

@Injectable()
export class ResendEmailAlertNotificationService implements NotificationService {
  private resendClient?: ResendAlertClient;
  private from?: string;

  constructor(client?: ResendAlertClient, from?: string) {
    this.resendClient = client;
    this.from = from;
  }

  async send(execution: AlertExecution): Promise<void> {
    const { client, from } = this.getProvider();
    const to = execution.destination;
    const subject = `DBMetrics alert: ${execution.metric}`;
    const text = [
      "A database alert was triggered.",
      `Connection: ${execution.connectionName}`,
      `Metric: ${execution.metric}`,
      `Value: ${execution.metricValue}`,
      `Condition: ${execution.operator} ${execution.threshold}`,
    ].join("\n");
    const html = `<p>A database alert was triggered.</p><dl><dt>Connection</dt><dd>${escapeHtml(execution.connectionName)}</dd><dt>Metric</dt><dd>${escapeHtml(execution.metric)}</dd><dt>Value</dt><dd>${execution.metricValue}</dd><dt>Condition</dt><dd>${escapeHtml(execution.operator)} ${execution.threshold}</dd></dl>`;

    try {
      console.info({ provider: "resend", from, to: maskEmail(to), status: "sending" });
      const { error } = await client.emails.send({ from, to, subject, html, text });
      if (error) {
        console.error({ provider: "resend", from, to: maskEmail(to), status: "error", error: safeProviderError(error, to) });
        throw new Error("Resend alert email delivery failed");
      }
      console.info({ provider: "resend", from, to: maskEmail(to), status: "success" });
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "Resend alert email delivery failed") {
        console.error({ provider: "resend", from, to: maskEmail(to), status: "error", error: safeProviderError(error, to) });
      }
      throw new Error("Resend alert email delivery failed");
    }
  }

  private getProvider(): { client: ResendAlertClient; from: string } {
    if (this.resendClient && this.from) {
      return { client: this.resendClient, from: this.from };
    }

    const email = getEnvironmentConfig().email;
    if (email.provider !== "resend" || !email.apiKey || !email.from) {
      throw new Error("Resend alert delivery is not configured");
    }

    this.resendClient ??= new Resend(email.apiKey) as unknown as ResendAlertClient;
    this.from ??= email.from;
    return { client: this.resendClient, from: this.from };
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@", 2);
  if (!domain) return "[invalid-email]";
  const visible = local.slice(0, Math.min(1, local.length));
  return `${visible}${"*".repeat(Math.max(1, local.length - visible.length))}@${domain}`;
}

function safeProviderError(error: unknown, recipient: string): { code?: string; message: string } {
  const record = error && typeof error === "object" ? error as { message?: unknown; code?: unknown } : undefined;
  const candidateMessage = error instanceof Error ? error.message : record?.message;
  let message = typeof candidateMessage === "string" ? candidateMessage : "Unknown provider error";
  message = redactSensitiveText(message)
    .replaceAll(recipient, "[REDACTED_RECIPIENT]")
    .replace(/\b(?:re|resend)[-_ ]?(?:api[-_ ]?)?key\b\s*[:=]?\s*[^\s,;]*/gi, "[REDACTED]")
    .replace(/\b[A-Za-z0-9_-]{20,}\b/g, "[REDACTED]")
    .slice(0, 300);
  const rawCode = record?.code;
  const code = typeof rawCode === "string" && /^[A-Za-z0-9_.-]{1,80}$/.test(rawCode) && !/^[A-Za-z0-9_-]{20,}$/.test(rawCode)
    ? rawCode
    : undefined;
  return { ...(code ? { code } : {}), message };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}