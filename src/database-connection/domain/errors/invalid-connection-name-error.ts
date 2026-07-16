import { DomainError } from "@/shared/errors/domain-error";

export class InvalidConnectionNameError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
