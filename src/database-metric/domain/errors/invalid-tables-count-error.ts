import { DomainError } from "@/shared/errors/domain-error";

export class InvalidTablesCountError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
