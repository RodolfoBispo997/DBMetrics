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
    JwtStrategy,
    RolesGuard,
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
