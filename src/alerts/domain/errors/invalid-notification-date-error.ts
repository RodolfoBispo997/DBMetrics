import { DomainError } from "@/shared/errors/domain-error";

export class InvalidNotificationDateError extends DomainError {
  constructor(reason: string) {
    super(reason, 400);
  }
}
