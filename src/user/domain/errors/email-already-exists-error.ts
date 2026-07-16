import { DomainError } from "@/shared/errors/domain-error";

export class EmailAlreadyExistsError extends DomainError {
  constructor(reason: string) {
    super(reason, 409);
  }
}
