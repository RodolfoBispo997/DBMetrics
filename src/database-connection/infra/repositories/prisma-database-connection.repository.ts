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

  async findManyByUserId(userId: string): Promise<DatabaseConnection[]> {
    const databaseConnections = await prisma.databaseConnection.findMany({
      where: {
        userId,
      },
    });

    return databaseConnections as unknown as DatabaseConnection[];
  }

  async findById(id: string): Promise<DatabaseConnection | null> {
    const databaseConnection = await prisma.databaseConnection.findUnique({
      where: {
        id: id,
      },
    });

    if (!databaseConnection) {
      return null;
    }

    return databaseConnection as unknown as DatabaseConnection;
  }

  async update(connection: DatabaseConnection): Promise<void> {
    await prisma.databaseConnection.update({
      where: {
        id: connection.id,
      },
      data: {
        name: connection.name,
        provider: connection.provider,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
      },
    });
  }
}
