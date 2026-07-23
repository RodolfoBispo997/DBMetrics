import { DomainError } from "@/shared/errors/domain-error";

export class InvalidCooldownMinutesError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
