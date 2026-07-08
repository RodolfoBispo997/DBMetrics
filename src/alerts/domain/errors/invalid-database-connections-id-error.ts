import { DomainError } from "../../../user/domain/errors/domain-error";

export class InvalidDatabaseConnectionsIdError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
