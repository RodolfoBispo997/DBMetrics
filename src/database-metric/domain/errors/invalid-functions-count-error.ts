import { DomainError } from "@/shared/errors/domain-error";

export class InvalidFunctionsCountError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
