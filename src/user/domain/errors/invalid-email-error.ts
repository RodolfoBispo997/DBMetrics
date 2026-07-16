import { DomainError } from "@/shared/errors/domain-error";

export class InvalidEmailError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
