import { DomainError } from "../../../user/domain/errors/domain-error";

export class AlertExecutionNotFoundError extends DomainError {
  constructor() {
    super("Alert execution not found", 404);
  }
}
