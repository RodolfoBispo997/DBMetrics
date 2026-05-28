import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { CreateUserUseCase } from "./application/use-cases/create-user/create-user.use-case";
import { PrismaUserRepository } from "./infra/repositories/prisma-user.repository";
import { BcryptHashGenerator } from "../shared/cryptography/bcrypt-hash-generator";

@Module({
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    {
      provide: "UserRepository",
      useClass: PrismaUserRepository,
    },
    {
      provide: "HashGenerator",
      useClass: BcryptHashGenerator,
    },
  ],
})
export class UserModule {}
