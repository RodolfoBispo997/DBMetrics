import { DomainError } from "../../../user/domain/errors/domain-error";

export class InvalidNotificationChannelError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
