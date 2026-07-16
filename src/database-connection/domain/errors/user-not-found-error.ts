import { DomainError } from "@/shared/errors/domain-error";

export class UserNotFoundError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
