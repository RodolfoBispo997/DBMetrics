import { DomainError } from "@/shared/errors/domain-error";

export class InvalidDashboardDateRangeError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
