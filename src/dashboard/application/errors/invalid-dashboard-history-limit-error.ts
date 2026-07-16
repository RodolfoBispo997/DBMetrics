import { DomainError } from "@/shared/errors/domain-error";

export class InvalidDashboardHistoryLimitError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
