import { Module } from "@nestjs/common";
import { DatabaseConnectionController } from "./database-connection.controller";
import { CreateDatabaseConnectionUseCase } from "./application/use-cases/create-database-connection/create-database-connection.use-case";
import { PrismaDatabaseConnectionRepository } from "./infra/repositories/prisma-database-connection.repository";
import { PrismaUserRepository } from "../user/infra/repositories/prisma-user.repository";
import { ListDatabaseConnectionsUseCase } from "./application/use-cases/list-database-connections/list-database-connections.use-case";
import { GetDatabaseConnectionByIdUseCase } from "./application/use-cases/get-database-connection-by-id/get-database-connections-by-id.use-case";
import { UpdateDatabaseConnectionUseCase } from "./application/use-cases/update-database-connection/update-database-connection.use-case";
import { DeleteDatabaseConnectionUseCase } from "./application/use-cases/delete-database-connection/delete-database-connection.use-case";

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

    ListDatabaseConnectionsUseCase,
    {
      provide: "DatabaseConnectionRepository",
      useClass: PrismaDatabaseConnectionRepository,
    },

    GetDatabaseConnectionByIdUseCase,
    {
      provide: "DatabaseConnectionRepository",
      useClass: PrismaDatabaseConnectionRepository,
    },

    UpdateDatabaseConnectionUseCase,
    {
      provide: "DatabaseConnectionRepository",
      useClass: PrismaDatabaseConnectionRepository,
    },

    DeleteDatabaseConnectionUseCase,
    {
      provide: "DatabaseConnectionRepository",
      useClass: PrismaDatabaseConnectionRepository,
    },
  ],
})
export class DatabaseConnectionModule {}
