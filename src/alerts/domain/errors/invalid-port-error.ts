import { DomainError } from "@/shared/errors/domain-error";

export class InvalidPortError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
