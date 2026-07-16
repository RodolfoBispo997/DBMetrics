import { UnauthorizedException } from "@nestjs/common";
import { DomainError } from "@/shared/errors/domain-error";

export class InvalidCredentialsError extends UnauthorizedException {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}
