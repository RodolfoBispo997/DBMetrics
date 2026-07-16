import { DomainError } from "@/shared/errors/domain-error";

export class InvalidMetricValueError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
