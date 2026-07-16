import { DomainError } from "@/shared/errors/domain-error";

export class InvalidDashboardHistoryPageError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
