import { prisma } from "../../../user/infra/database/prisma/prisma-client";
import { DatabaseConnectionRepository } from "../../application/repositories/database-connection-repository";
import { DatabaseConnection } from "../../domain/entities/database-connection";
import { DatabaseProvider } from "../../domain/enums/database-provider.enum";

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

    return databaseConnections.map((connection) =>
      DatabaseConnection.restore({
        id: connection.id,
        name: connection.name,
        provider: connection.provider as DatabaseProvider,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
        userId: connection.userId,
      }),
    );
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

    return DatabaseConnection.restore({
      id: databaseConnection.id,
      name: databaseConnection.name,
      provider: databaseConnection.provider as DatabaseProvider,
      host: databaseConnection.host,
      port: databaseConnection.port,
      database: databaseConnection.database,
      username: databaseConnection.username,
      password: databaseConnection.password,
      userId: databaseConnection.userId,
    });
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

  async delete(id: string) {
    await prisma.databaseConnection.delete({
      where: {
        id: id,
      },
    });
  }
}
