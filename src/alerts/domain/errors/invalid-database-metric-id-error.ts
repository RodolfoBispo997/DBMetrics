import { DomainError } from "@/shared/errors/domain-error";

export class InvalidDatabaseMetricIdError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
