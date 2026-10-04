import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthenticateUserUseCase } from "../user/application/use-cases/authenticate-user/authenticate-user-use-case";
import { PrismaUserRepository } from "../user/infra/repositories/prisma-user.repository";
import { BcryptHashComparer } from "../shared/cryptography/bcrypt-hash-comparer";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RolesGuard } from "./guards/roles.guard";
import { getEnvironmentConfig } from "../shared/config/environment.config";
import { RegisterPublicUserUseCase } from "../user/application/use-cases/public-registration/register-public-user.use-case";
import { VerifyEmailUseCase } from "../user/application/use-cases/public-registration/verify-email.use-case";
import { PublicRegistrationEnabledGuard } from "./guards/public-registration-enabled.guard";
import { PrismaPublicRegistrationRepository } from "../user/infra/repositories/prisma-public-registration.repository";
import { BcryptHashGenerator } from "../shared/cryptography/bcrypt-hash-generator";
import { EMAIL_CONFIRMATION_SENDER } from "../user/application/use-cases/public-registration/email-confirmation-sender";
import { LocalEmailConfirmationSender } from "../user/infra/email-confirmation/local-email-confirmation-sender";
import { UnconfiguredEmailConfirmationSender } from "../user/infra/email-confirmation/unconfigured-email-confirmation-sender";

@Module({
  imports: [
    PassportModule,

    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getEnvironmentConfig().jwtSecret,
        signOptions: {
          expiresIn: "1d",
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthenticateUserUseCase,
    RegisterPublicUserUseCase,
    VerifyEmailUseCase,
    JwtStrategy,
    RolesGuard,
    PublicRegistrationEnabledGuard,
    {
      provide: "PublicRegistrationRepository",
      useClass: PrismaPublicRegistrationRepository,
    },
    {
      provide: "HashGenerator",
      useClass: BcryptHashGenerator,
    },
    {
      provide: EMAIL_CONFIRMATION_SENDER,
      useFactory: () => {
        if (
          process.env.NODE_ENV !== "development" &&
          process.env.NODE_ENV !== "test"
        ) {
          if (getEnvironmentConfig().publicRegistrationEnabled) {
            throw new Error(
              "Public registration in production requires a real email confirmation provider",
            );
          }

          return new UnconfiguredEmailConfirmationSender();
        }

        return new LocalEmailConfirmationSender();
      },
    },
    {
      provide: "UserRepository",
      useClass: PrismaUserRepository,
    },
    {
      provide: "HashComparer",
      useClass: BcryptHashComparer,
    },
  ],
})
export class AuthModule {}
