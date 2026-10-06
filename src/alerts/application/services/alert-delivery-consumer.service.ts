import { Logger } from "@nestjs/common";

import { AlertExecutionRepository } from "../repositories/alert-execution-repository";
import { AlertOutboxRepository } from "../repositories/alert-outbox-repository";
import { NotificationService } from "./notification.service";
import { getEnvironmentConfig } from "../../../shared/config/environment.config";

export type AlertDeliveryMessage = {
  eventId: string;
  alertExecutionId: string;
  idempotencyKey: string;
};

export interface DeliveryMessageTransport<TMessage = unknown> {
  ack(message: TMessage): void;
  nackToDlq(message: TMessage): void;
  scheduleRetry(message: TMessage, retryAfterMs: number): Promise<void>;
}

export class AlertDeliveryConsumerService<TMessage = unknown> {
  private readonly logger = new Logger(AlertDeliveryConsumerService.name);

  constructor(
    private readonly executions: AlertExecutionRepository,
    private readonly outbox: AlertOutboxRepository,
    private readonly notifier: NotificationService,
    private readonly transport: DeliveryMessageTransport<TMessage>,
  ) {}

  async handle(message: TMessage, content: Buffer | string): Promise<void> {
    let parsed: AlertDeliveryMessage;
    try {
      parsed = this.parse(content);
    } catch (error) {
      this.transport.ack(message);
      this.logger.warn(`Discarding malformed alert message: ${this.sanitize(error)}`);
      return;
    }

    const claim = await this.executions.claimForDelivery(
      parsed.alertExecutionId,
      getEnvironmentConfig().alerts.outbox.leaseMs,
    );

    if (claim.kind === "missing" || claim.kind === "terminal") {
      this.transport.ack(message);
      return;
    }

    if (claim.kind === "busy") {
      try {
        await this.transport.scheduleRetry(message, claim.retryAfterMs);
        this.transport.ack(message);
      } catch (error) {
        this.logger.error(`Unable to schedule delivery retry: ${this.sanitize(error)}`);
        throw error;
      }
      return;
    }

    try {
      await this.notifier.send(claim.execution);
      const updated = await this.executions.markDeliverySucceeded(
        claim.execution.id,
        claim.execution.alertRuleId,
        claim.claimToken,
        new Date(),
      );
      this.transport.ack(message);
      if (!updated) this.logger.warn("Delivery claim was lost before success persistence");
      return;
    } catch (error) {
      const sanitized = this.sanitize(error);
      const config = getEnvironmentConfig().alerts.outbox;
      const outbox = await this.outbox.findByAlertExecutionId(claim.execution.id);

      if (claim.deliveryAttemptCount >= config.maxAttempts) {
        const updated = outbox
          ? await this.executions.markDeliveryFailed(claim.execution.id, outbox.id, claim.claimToken, sanitized)
          : false;
        if (updated) this.transport.nackToDlq(message);
        else this.transport.ack(message);
        return;
      }

      if (!outbox) {
        this.transport.ack(message);
        return;
      }

      const nextAttempt = claim.deliveryAttemptCount + 1;
      const delay = Math.min(
        config.retryBaseDelayMs * 2 ** Math.max(0, nextAttempt - 1),
        config.retryMaxDelayMs,
      );
      const updated = await this.executions.markDeliveryRetry(
        claim.execution.id,
        outbox.id,
        claim.claimToken,
        new Date(Date.now() + delay),
        sanitized,
      );
      this.transport.ack(message);
      if (!updated) this.logger.warn("Delivery claim was lost before retry persistence");
    }
  }

  private parse(content: Buffer | string): AlertDeliveryMessage {
    const value = JSON.parse(content.toString()) as Partial<AlertDeliveryMessage>;
    if (
      typeof value.eventId !== "string" ||
      typeof value.alertExecutionId !== "string" ||
      typeof value.idempotencyKey !== "string"
    ) {
      throw new Error("invalid alert message");
    }
    return value as AlertDeliveryMessage;
  }

  private sanitize(error: unknown): string {
    if (error instanceof Error) {
      return error.message.replace(/https?:\/\/\S+/g, "[url]").slice(0, 1000);
    }
    return "Alert delivery failed";
  }
}
