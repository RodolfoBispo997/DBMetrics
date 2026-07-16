import { DomainError } from "@/shared/errors/domain-error";

export class DatabaseConnectionNotFoundError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
