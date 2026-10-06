import { AlertOutboxEvent } from "../../domain/entities/alert-outbox-event";

export interface AlertOutboxRepository {
  save(event: AlertOutboxEvent): Promise<void>;
  findByIdempotencyKey(idempotencyKey: string): Promise<AlertOutboxEvent | null>;
  findByAlertExecutionId(alertExecutionId: string): Promise<AlertOutboxEvent | null>;
  claimNextReady(limit: number): Promise<AlertOutboxEvent[]>;
  markPublished(id: string, publishedAt: Date): Promise<void>;
  markRetry(
    id: string,
    publishAttemptCount: number,
    availableAt: Date,
    sanitizedError: string,
  ): Promise<void>;
  markFailed(id: string, sanitizedError: string): Promise<void>;
}
