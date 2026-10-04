import { DomainError } from "@/shared/errors/domain-error";

export class InvalidEmailConfirmationTokenError extends DomainError {
  constructor() {
    super("Invalid or expired email confirmation token", 400);
  }
}
