import { DomainError } from "./domain-error";

export class EmailAlreadyExistsError extends DomainError {
  constructor(reason: string) {
    super(reason, 409);
  }
}
