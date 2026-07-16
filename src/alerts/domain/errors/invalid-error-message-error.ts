import { DomainError } from "@/shared/errors/domain-error";

export class InvalidErrorMessageError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
