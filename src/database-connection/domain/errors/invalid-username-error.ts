import { DomainError } from "@/shared/errors/domain-error";

export class InvalidUsernameError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
