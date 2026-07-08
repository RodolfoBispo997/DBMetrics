import { DomainError } from "../../../user/domain/errors/domain-error";

export class InvalidAlertOperatorError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
