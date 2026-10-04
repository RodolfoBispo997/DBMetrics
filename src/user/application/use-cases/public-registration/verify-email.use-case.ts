import { createHash } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { PublicRegistrationRepository } from "../../repositories/public-registration-repository";
import { InvalidEmailConfirmationTokenError } from "../../../domain/errors/invalid-email-confirmation-token-error";
import { VerifyEmailRequestDTO } from "./dto/verify-email-request.dto";

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject("PublicRegistrationRepository")
    private readonly registrationRepository: PublicRegistrationRepository,
  ) {}

  async execute(data: VerifyEmailRequestDTO): Promise<{ verified: true }> {
    const tokenHash = createHash("sha256").update(data.token).digest("hex");
    const now = new Date();
    const token = await this.registrationRepository.findActiveTokenByHash(
      tokenHash,
      now,
    );

    if (!token) {
      throw new InvalidEmailConfirmationTokenError();
    }

    const confirmed = await this.registrationRepository.confirmEmail(
      token.id,
      token.userId,
      now,
    );

    if (!confirmed) {
      throw new InvalidEmailConfirmationTokenError();
    }

    return { verified: true };
  }
}
