import { DomainError } from "@/shared/errors/domain-error";

export class InvalidDatabaseConnectionIdError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
