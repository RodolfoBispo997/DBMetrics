import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionNotFoundError } from "../../../domain/errors/database-connection-not-found-error";
import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { DeleteDatabaseConnectionRequestDTO } from "./dto/delete-database-connection-request.dto";

@Injectable()
export class DeleteDatabaseConnectionUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
  ) {}

  async execute(data: DeleteDatabaseConnectionRequestDTO): Promise<void> {
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

    await this.databaseConnectionRepository.delete(data.id);
  }
}
