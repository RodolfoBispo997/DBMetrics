import { DomainError } from "@/shared/errors/domain-error";

export class InvalidIndexesCountError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
