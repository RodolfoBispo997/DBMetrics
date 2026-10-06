import { randomUUID } from "node:crypto";

export type AlertOutboxEventType = "ALERT_NOTIFICATION";

export type AlertOutboxEventPayload = {
  alertExecutionId: string;
  channel: string;
  destination: string;
  executedAt: string;
};

export type AlertOutboxEventProps = {
  id: string;
  alertExecutionId: string;
  type: AlertOutboxEventType;
  payload: AlertOutboxEventPayload;
  idempotencyKey: string;
  publishAttemptCount: number;
  availableAt: Date;
  publishedAt?: Date | null;
  claimedAt?: Date | null;
  claimExpiresAt?: Date | null;
  failedAt?: Date | null;
  lastError?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class AlertOutboxEvent {
  private constructor(private readonly props: AlertOutboxEventProps) {}

  static create(
    payload: AlertOutboxEventPayload,
    idempotencyKey: string,
    alertExecutionId: string,
    availableAt: Date = new Date(),
  ): AlertOutboxEvent {
    return new AlertOutboxEvent({
      id: randomUUID(),
      alertExecutionId,
      type: "ALERT_NOTIFICATION",
      payload,
      idempotencyKey,
      publishAttemptCount: 0,
      availableAt,
      publishedAt: null,
      claimedAt: null,
      claimExpiresAt: null,
      failedAt: null,
      lastError: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: AlertOutboxEventProps): AlertOutboxEvent {
    return new AlertOutboxEvent({
      ...props,
      publishedAt: props.publishedAt ?? null,
      claimedAt: props.claimedAt ?? null,
      claimExpiresAt: props.claimExpiresAt ?? null,
      failedAt: props.failedAt ?? null,
      lastError: props.lastError ?? null,
    });
  }

  markPublished(): void {
    this.props.publishedAt = new Date();
    this.props.updatedAt = new Date();
  }

  markRetry(errorMessage: string, retryAt: Date): void {
    this.props.publishAttemptCount += 1;
    this.props.availableAt = retryAt;
    this.props.lastError = errorMessage.slice(0, 1000);
    this.props.updatedAt = new Date();
  }

  markFailed(errorMessage: string): void {
    this.props.lastError = errorMessage.slice(0, 1000);
    this.props.failedAt = new Date();
    this.props.claimedAt = null;
    this.props.claimExpiresAt = null;
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }

  get alertExecutionId(): string {
    return this.props.alertExecutionId;
  }

  get type(): AlertOutboxEventType {
    return this.props.type;
  }

  get payload(): AlertOutboxEventPayload {
    return this.props.payload;
  }

  get idempotencyKey(): string {
    return this.props.idempotencyKey;
  }

  get publishAttemptCount(): number {
    return this.props.publishAttemptCount;
  }

  get availableAt(): Date {
    return this.props.availableAt;
  }

  get publishedAt(): Date | null {
    return this.props.publishedAt ?? null;
  }

  get lastError(): string | null {
    return this.props.lastError ?? null;
  }
  get claimedAt(): Date | null { return this.props.claimedAt ?? null; }
  get claimExpiresAt(): Date | null { return this.props.claimExpiresAt ?? null; }
  get failedAt(): Date | null { return this.props.failedAt ?? null; }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
