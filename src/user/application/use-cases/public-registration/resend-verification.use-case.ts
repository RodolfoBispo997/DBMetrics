import { createHash, randomBytes } from "node:crypto";
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { EmailConfirmationToken } from "../../../domain/entities/email-confirmation-token.entity";
import { PublicRegistrationRepository } from "../../repositories/public-registration-repository";
import { UserRepository } from "../../repositories/user-repository";
import {
  EMAIL_CONFIRMATION_SENDER,
  EmailConfirmationSender,
} from "./email-confirmation-sender";
import { ResendVerificationRequestDTO } from "./dto/resend-verification-request.dto";

export type ResendVerificationResponseDTO = {
  message: string;
};

@Injectable()
export class ResendVerificationUseCase {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("PublicRegistrationRepository")
    private readonly registrationRepository: PublicRegistrationRepository,
    @Inject(EMAIL_CONFIRMATION_SENDER)
    private readonly confirmationSender: EmailConfirmationSender,
  ) {}

  async execute(
    data: ResendVerificationRequestDTO,
  ): Promise<ResendVerificationResponseDTO> {
    const email = data.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(email);

    if (!existingUser || existingUser.emailVerifiedAt) {
      return this.genericResponse();
    }

    const rawToken = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const token = EmailConfirmationToken.create(existingUser.id, tokenHash);
    const user =
      await this.registrationRepository.replacePendingUserConfirmationToken(
        email,
        existingUser.id,
        token,
        new Date(),
      );

    if (user) {
      try {
        await this.confirmationSender.send({
          email: user.email,
          name: user.name,
          token: rawToken,
        });
      } catch {
        throw new ServiceUnavailableException(
          "Email confirmation could not be sent. Please try again later.",
        );
      }
    }

    return this.genericResponse();
  }

  private genericResponse(): ResendVerificationResponseDTO {
    return {
      message:
        "If the account is pending verification, a confirmation email will be sent shortly.",
    };
  }
}
