import { AlertExecution } from "../../domain/entities/alert-execution";
import { AlertOutboxEvent } from "../../domain/entities/alert-outbox-event";

export interface FindAlertExecutionsByConnectionIdResult {
  executions: AlertExecution[];
  total: number;
}

export type DeliveryClaimResult =
  | { kind: "claimed"; claimToken: string; execution: AlertExecution; deliveryAttemptCount: number }
  | { kind: "busy"; retryAfterMs: number }
  | { kind: "terminal" }
  | { kind: "missing" };

export interface AlertExecutionRepository {
  save(alertExecution: AlertExecution): Promise<void>;
  saveWithOutbox(
    alertExecution: AlertExecution,
    alertOutboxEvent: AlertOutboxEvent,
  ): Promise<void>;
  claimForDelivery(id: string, leaseMs: number): Promise<DeliveryClaimResult>;
  markDeliverySucceeded(id: string, alertRuleId: string, claimToken: string, sentAt: Date): Promise<boolean>;
  markDeliveryRetry(id: string, outboxId: string, claimToken: string, availableAt: Date, error: string): Promise<boolean>;
  markDeliveryFailed(id: string, outboxId: string, claimToken: string, error: string): Promise<boolean>;
  markPublicationFailed(id: string, outboxId: string, error: string): Promise<void>;
  update(alertExecution: AlertExecution): Promise<void>;
  findById(id: string): Promise<AlertExecution | null>;
  findManyByConnectionId(data: {
    connectionId: string;
    skip: number;
    take: number;
  }): Promise<FindAlertExecutionsByConnectionIdResult>;
  findRecent(limit: number): Promise<AlertExecution[]>;
}
