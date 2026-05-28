import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthenticateUserUseCase } from "../user/application/use-cases/authenticate-user/authenticate-user-use-case";
import { PrismaUserRepository } from "../user/infra/repositories/prisma-user.repository";
import { BcryptHashComparer } from "../shared/cryptography/bcrypt-hash-comparer";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule,

    JwtModule.register({
      secret: "dbmetrics-secret",
      signOptions: {
        expiresIn: "1d",
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthenticateUserUseCase,
    JwtStrategy,
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
