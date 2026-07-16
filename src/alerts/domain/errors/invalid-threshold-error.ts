import { DomainError } from "@/shared/errors/domain-error";

export class InvalidThresholdError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
