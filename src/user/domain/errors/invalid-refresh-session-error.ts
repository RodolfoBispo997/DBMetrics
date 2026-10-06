import { DomainError } from "../../../shared/errors/domain-error";

export class InvalidRefreshSessionError extends DomainError {
  constructor() {
    super("Invalid refresh session", 401);
    this.name = "InvalidRefreshSessionError";
  }
}
