import { DomainError } from "@/shared/errors/domain-error";

export class EmailNotVerifiedError extends DomainError {
  constructor() {
    super("Email verification required", 403);
  }
}
