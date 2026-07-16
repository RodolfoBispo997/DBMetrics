import { DomainError } from "@/shared/errors/domain-error";

export class InvalidAlertMetricError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
