import { DomainError } from "@/shared/errors/domain-error";

export class InvalidUserIdError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
