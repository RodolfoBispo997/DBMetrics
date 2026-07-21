import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/infra/database/prisma/prisma.service";
import { DatabaseCredentialsCipherService } from "../../../shared/security/database-credentials/database-credentials-cipher.service";
import { DatabaseConnectionRepository } from "../../application/repositories/database-connection-repository";
import { DatabaseConnection } from "../../domain/entities/database-connection";
import { DatabaseProvider } from "../../domain/enums/database-provider.enum";

@Injectable()
export class PrismaDatabaseConnectionRepository implements DatabaseConnectionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly databaseCredentialsCipher: DatabaseCredentialsCipherService,
  ) {}

  async save(connection: DatabaseConnection): Promise<void> {
    await this.prisma.databaseConnection.create({
      data: {
        id: connection.id,
        name: connection.name,
        provider: connection.provider,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: this.databaseCredentialsCipher.encrypt(connection.password),
        userId: connection.userId,
      },
    });
  }

  async findManyByUserId(userId: string): Promise<DatabaseConnection[]> {
    const databaseConnections = await this.prisma.databaseConnection.findMany({
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
        password: this.databaseCredentialsCipher.decrypt(connection.password),
        userId: connection.userId,
      }),
    );
  }

  async findById(id: string): Promise<DatabaseConnection | null> {
    const databaseConnection = await this.prisma.databaseConnection.findUnique({
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
      password: this.databaseCredentialsCipher.decrypt(databaseConnection.password),
      userId: databaseConnection.userId,
    });
  }

  async findAll(): Promise<DatabaseConnection[]> {
    const databaseConnections = await this.prisma.databaseConnection.findMany();

    return databaseConnections.map((connection) =>
      DatabaseConnection.restore({
        id: connection.id,
        name: connection.name,
        provider: connection.provider as DatabaseProvider,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: this.databaseCredentialsCipher.decrypt(connection.password),
        userId: connection.userId,
      }),
    );
  }

  async update(connection: DatabaseConnection): Promise<void> {
    await this.prisma.databaseConnection.update({
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
        password: this.databaseCredentialsCipher.encrypt(connection.password),
      },
    });
  }

  async delete(id: string) {
    await this.prisma.databaseConnection.delete({
      where: {
        id: id,
      },
    });
  }
}
