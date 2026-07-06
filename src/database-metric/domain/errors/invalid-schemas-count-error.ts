import { DomainError } from "../../../user/domain/errors/domain-error";

export class InvalidSchemasCountError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
