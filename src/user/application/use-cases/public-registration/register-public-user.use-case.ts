import { createHash, randomBytes } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { HashGenerator } from "../../../../shared/cryptography/hash-generator";
import { EmailConfirmationToken } from "../../../domain/entities/email-confirmation-token.entity";
import { User } from "../../../domain/entities/user.entity";
import { UserRole } from "../../../domain/enums/user-role.enum";
import { EmailAlreadyExistsError } from "../../../domain/errors/email-already-exists-error";
import { PublicRegistrationRepository } from "../../repositories/public-registration-repository";
import { UserRepository } from "../../repositories/user-repository";
import {
  EMAIL_CONFIRMATION_SENDER,
  EmailConfirmationSender,
} from "./email-confirmation-sender";
import { PublicRegistrationRequestDTO } from "./dto/public-registration-request.dto";
import { PublicRegistrationResponseDTO } from "./dto/public-registration-response.dto";

@Injectable()
export class RegisterPublicUserUseCase {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("PublicRegistrationRepository")
    private readonly registrationRepository: PublicRegistrationRepository,
    @Inject("HashGenerator")
    private readonly hashGenerator: HashGenerator,
    @Inject(EMAIL_CONFIRMATION_SENDER)
    private readonly confirmationSender: EmailConfirmationSender,
  ) {}

  async execute(
    data: PublicRegistrationRequestDTO,
  ): Promise<PublicRegistrationResponseDTO> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new EmailAlreadyExistsError("Email already exist");
    }

    const hashedPassword = await this.hashGenerator.hash(data.password);
    const user = User.create({
      name: data.name,
      email: normalizedEmail,
      password: hashedPassword,
      role: UserRole.MEMBER,
      emailVerifiedAt: null,
    });
    const rawToken = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    // A later phase will resend by invalidating prior active tokens for this user.
    const token = EmailConfirmationToken.create(user.id, tokenHash);

    await this.registrationRepository.createUserWithConfirmation(user, token);
    await this.confirmationSender.send({
      email: user.email,
      name: user.name,
      token: rawToken,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: UserRole.MEMBER,
    };
  }
}
