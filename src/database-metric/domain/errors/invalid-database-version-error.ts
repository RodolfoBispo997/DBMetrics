import { DomainError } from "@/shared/errors/domain-error";

export class InvalidDatabaseVersionError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
