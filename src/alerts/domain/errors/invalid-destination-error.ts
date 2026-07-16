import { DomainError } from "@/shared/errors/domain-error";

export class InvalidDestinationError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
