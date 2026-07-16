import { DomainError } from "@/shared/errors/domain-error";

export class InvalidDatabaseSizeError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
