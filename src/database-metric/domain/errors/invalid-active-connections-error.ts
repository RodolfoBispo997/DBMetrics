import { DomainError } from "@/shared/errors/domain-error";

export class InvalidActiveConnectionsError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
