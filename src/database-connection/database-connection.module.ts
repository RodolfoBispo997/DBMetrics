import { Module } from "@nestjs/common";
import { DatabaseConnectionController } from "./database-connection.controller";
import { CreateDatabaseConnectionUseCase } from "./application/use-cases/create-database-connection/create-database-connection.use-case";
import { PrismaDatabaseConnectionRepository } from "./infra/repositories/prisma-database-connection.repository";
import { PrismaUserRepository } from "../user/infra/repositories/prisma-user.repository";

@Module({
  controllers: [DatabaseConnectionController],
  providers: [
    CreateDatabaseConnectionUseCase,
    {
      provide: "DatabaseConnectionRepository",
      useClass: PrismaDatabaseConnectionRepository,
    },
    {
      provide: "UserRepository",
      useClass: PrismaUserRepository,
    },
  ],
})
export class DatabaseConnectionModule {}
