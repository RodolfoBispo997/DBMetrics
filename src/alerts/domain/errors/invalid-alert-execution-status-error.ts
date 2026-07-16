import { DomainError } from "@/shared/errors/domain-error";

export class InvalidAlertExecutionStatusError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
