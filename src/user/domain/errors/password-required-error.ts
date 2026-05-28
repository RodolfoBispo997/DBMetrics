import { DomainError } from "./domain-error";

export class PasswordRequiredError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
