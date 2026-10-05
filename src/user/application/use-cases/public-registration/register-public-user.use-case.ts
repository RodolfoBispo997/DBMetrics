import { createHash, randomBytes } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { HashGenerator } from "../../../../shared/cryptography/hash-generator";
import { EmailConfirmationToken } from "../../../domain/entities/email-confirmation-token.entity";
import { User } from "../../../domain/entities/user.entity";
import { UserRole } from "../../../domain/enums/user-role.enum";
import { PublicRegistrationRepository } from "../../repositories/public-registration-repository";
import { UserRepository } from "../../repositories/user-repository";
import {
  EMAIL_CONFIRMATION_SENDER,
  EmailConfirmationSender,
} from "./email-confirmation-sender";
import { PublicRegistrationRequestDTO } from "./dto/public-registration-request.dto";
import { PublicRegistrationResponseDTO } from "./dto/public-registration-response.dto";

const genericResponse: PublicRegistrationResponseDTO = {
  message:
    "If your information is valid, an email confirmation message will be sent shortly.",
};

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
      return genericResponse;
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
    const token = EmailConfirmationToken.create(user.id, tokenHash);

    try {
      await this.registrationRepository.createUserWithConfirmation(user, token);
    } catch (error) {
      if (isEmailUniqueConstraintViolation(error)) {
        return genericResponse;
      }

      throw error;
    }

    await this.confirmationSender.send({
      email: user.email,
      name: user.name,
      token: rawToken,
    });

    return genericResponse;
  }
}

function isEmailUniqueConstraintViolation(error: unknown): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    error.code !== "P2002" ||
    !("meta" in error) ||
    typeof error.meta !== "object" ||
    error.meta === null ||
    !("target" in error.meta)
  ) {
    return false;
  }

  const target = error.meta.target;
  if (Array.isArray(target)) {
    return target.some(
      (field) => typeof field === "string" && field.toLowerCase() === "email",
    );
  }

  return typeof target === "string" && target.toLowerCase().includes("email");
}
