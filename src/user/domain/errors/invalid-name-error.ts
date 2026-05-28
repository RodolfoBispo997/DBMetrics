import { DomainError } from "./domain-error";

export class InvalidNameError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
