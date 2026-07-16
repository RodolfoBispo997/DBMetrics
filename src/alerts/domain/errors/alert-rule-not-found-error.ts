import { DomainError } from "@/shared/errors/domain-error";

export class AlertRuleNotFoundError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
