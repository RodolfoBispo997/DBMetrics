import { DomainError } from "./domain-error";

export class InvalidEmailError extends DomainError {
  constructor(reason: string) {
    super(reason);
  }
}
