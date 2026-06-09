import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionNotFoundError } from "../../../domain/errors/database-connection-not-found-error";
import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { GetDatabaseConnectionByIdRequestDTO } from "./dto/get-database-connection-by-id-request.dto";
import { GetDatabaseConnectionByIdResponseDTO } from "./dto/get-database-connection-by-id-response.dto";

@Injectable()
export class GetDatabaseConnectionByIdUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
  ) {}

  async execute(
    data: GetDatabaseConnectionByIdRequestDTO,
  ): Promise<GetDatabaseConnectionByIdResponseDTO> {
    const databaseConnection = await this.databaseConnectionRepository.findById(
      data.id,
    );

    if (!databaseConnection) {
      throw new DatabaseConnectionNotFoundError(
        "Database connection not found.",
      );
    }

    if (databaseConnection.userId !== data.userId) {
      throw new DatabaseConnectionNotFoundError(
        "Database connection not found.",
      );
    }

    return {
      id: databaseConnection.id,
      name: databaseConnection.name,
      provider: databaseConnection.provider,
      host: databaseConnection.host,
      port: databaseConnection.port,
      database: databaseConnection.database,
      username: databaseConnection.username,
      userId: databaseConnection.userId,
    };
  }
}
