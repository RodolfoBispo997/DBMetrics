import { DomainError } from "../../../user/domain/errors/domain-error";

export class InvalidAlertRuleIdError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
