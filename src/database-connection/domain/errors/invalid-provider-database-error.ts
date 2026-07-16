import { DomainError } from "@/shared/errors/domain-error";

export class InvalidProviderDatabaseError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
