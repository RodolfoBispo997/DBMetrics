import { DomainError } from "@/shared/errors/domain-error";

export class InvalidNameError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
