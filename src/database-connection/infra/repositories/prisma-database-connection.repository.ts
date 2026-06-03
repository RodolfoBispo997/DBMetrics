import { prisma } from "../../../user/infra/database/prisma/prisma-client";
import { DatabaseConnectionRepository } from "../../application/repositories/database-connection-repository";
import { DatabaseConnection } from "../../domain/entities/database-connection";

export class PrismaDatabaseConnectionRepository implements DatabaseConnectionRepository {
  async save(connection: DatabaseConnection): Promise<void> {
    await prisma.databaseConnection.create({
      data: {
        id: connection.id,
        name: connection.name,
        provider: connection.provider,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
        userId: connection.userId,
      },
    });
  }
}
