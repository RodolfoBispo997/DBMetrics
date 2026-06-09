import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionNotFoundError } from "../../../domain/errors/database-connection-not-found-error";
import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { UpdateDatabaseConnectionRequestDTO } from "./dto/update-database-connection-request.dto";
import { UpdateDatabaseConnectionResponseDTO } from "./dto/update-database-connection-response.dto";

@Injectable()
export class UpdateDatabaseConnectionUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
  ) {}

  async execute(
    data: UpdateDatabaseConnectionRequestDTO,
  ): Promise<UpdateDatabaseConnectionResponseDTO> {
    const databaseConnection = await this.databaseConnectionRepository.findById(
      data.id,
    );

    if (!databaseConnection) {
      throw new DatabaseConnectionNotFoundError(
        "Database connection not found",
      );
    }

    if (databaseConnection.userId !== data.userId) {
      throw new DatabaseConnectionNotFoundError(
        "Database connection not found",
      );
    }

    databaseConnection.update({
      name: data.name,
      provider: data.provider,
      host: data.host,
      port: data.port,
      database: data.database,
      username: data.username,
      password: data.password,
    });

    await this.databaseConnectionRepository.update(databaseConnection);

    return {
      name: databaseConnection.name,
      provider: databaseConnection.provider,
      host: databaseConnection.host,
      port: databaseConnection.port,
      database: databaseConnection.database,
      username: databaseConnection.username,
    };
  }
}
