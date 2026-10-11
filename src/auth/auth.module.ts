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
import { createEmailConfirmationSender } from "./email-confirmation-sender.factory";
import { ResendVerificationUseCase } from "../user/application/use-cases/public-registration/resend-verification.use-case";
import { ThrottlerModule } from "@nestjs/throttler";
import { CreateRefreshSessionUseCase } from "../user/application/use-cases/refresh-session/create-refresh-session.use-case";
import { RotateRefreshSessionUseCase } from "../user/application/use-cases/refresh-session/rotate-refresh-session.use-case";
import { LogoutRefreshSessionUseCase } from "../user/application/use-cases/refresh-session/logout-refresh-session.use-case";
import { PrismaRefreshSessionRepository } from "../user/infra/repositories/prisma-refresh-session.repository";
import { getRefreshTokenTtlDays } from "../shared/config/environment.config";
import { REFRESH_TOKEN_TTL_DAYS } from "../user/application/use-cases/refresh-session/refresh-session.constants";

@Module({
  imports: [
    PassportModule,
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60 * 1000,
        limit: 60,
      },
    ]),

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
    ResendVerificationUseCase,
    CreateRefreshSessionUseCase,
    RotateRefreshSessionUseCase,
    LogoutRefreshSessionUseCase,
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
        return createEmailConfirmationSender(getEnvironmentConfig());
      },
    },
    {
      provide: "UserRepository",
      useClass: PrismaUserRepository,
    },
    {
      provide: "RefreshSessionRepository",
      useClass: PrismaRefreshSessionRepository,
    },
    {
      provide: REFRESH_TOKEN_TTL_DAYS,
      useFactory: getRefreshTokenTtlDays,
    },
    {
      provide: "HashComparer",
      useClass: BcryptHashComparer,
    },
  ],
})
export class AuthModule {}
