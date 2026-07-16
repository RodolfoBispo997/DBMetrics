import { DomainError } from "@/shared/errors/domain-error";

export class InvalidViewsCountError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
