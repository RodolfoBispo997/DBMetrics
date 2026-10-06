import { Injectable, Logger } from "@nestjs/common";

import { AlertOutboxRepository } from "../repositories/alert-outbox-repository";
import { AlertExecutionRepository } from "../repositories/alert-execution-repository";
import { getEnvironmentConfig } from "../../../shared/config/environment.config";

export type AlertDeliveryMessage = {
  eventId: string;
  alertExecutionId: string;
  idempotencyKey: string;
};

export interface AlertOutboxPublisher {
  publish(event: AlertDeliveryMessage): Promise<void>;
}

@Injectable()
export class AlertOutboxDispatcherService {
  private readonly logger = new Logger(AlertOutboxDispatcherService.name);

  constructor(
    private readonly outboxRepository: AlertOutboxRepository,
    private readonly publisher: AlertOutboxPublisher,
    private readonly executionRepository: AlertExecutionRepository,
  ) {}

  async dispatchPending(limit = 50): Promise<number> {
    const events = await this.outboxRepository.claimNextReady(limit);
    let processed = 0;

    for (const event of events) {
      const nextAttemptCount = event.publishAttemptCount + 1;
      const config = getEnvironmentConfig().alerts.outbox;
      const maxAttempts = config.maxAttempts;
      const retryBaseDelayMs = config.retryBaseDelayMs;
      const retryMaxDelayMs = config.retryMaxDelayMs;
      const retryDelayMs = Math.min(
        retryBaseDelayMs * 2 ** Math.max(0, nextAttemptCount - 1),
        retryMaxDelayMs,
      );

      try {
        await this.publisher.publish({
          eventId: event.id,
          alertExecutionId: event.alertExecutionId,
          idempotencyKey: event.idempotencyKey,
        });

        await this.outboxRepository.markPublished(event.id, new Date());
        processed += 1;
      } catch (error) {
        const sanitized = this.sanitizeError(error);

        if (nextAttemptCount >= maxAttempts) {
          await this.executionRepository.markPublicationFailed(
            event.alertExecutionId,
            event.id,
            sanitized,
          );
          this.logger.warn(
            `Outbox event ${event.id} reached the max retry count and was marked failed`,
          );
          continue;
        }

        const nextAttemptAt = new Date(Date.now() + retryDelayMs);
        await this.outboxRepository.markRetry(
          event.id,
          nextAttemptCount,
          nextAttemptAt,
          sanitized,
        );

        this.logger.warn(
          `Outbox event ${event.id} retry scheduled in ${retryDelayMs}ms`,
        );
      }
    }

    return processed;
  }

  private sanitizeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message.replace(/https?:\/\/\S+/g, "[url]").slice(0, 1000);
    }

    return "Notification dispatch failed";
  }
}
