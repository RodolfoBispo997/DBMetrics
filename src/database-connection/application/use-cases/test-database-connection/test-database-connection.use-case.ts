import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionNotFoundError } from "../../../domain/errors/database-connection-not-found-error";
import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { DatabaseConnectionTesterFactory } from "../../services/database-connection-tester-factory";
import { TestDatabaseConnectionRequestDTO } from "./dto/test-database-connection-request.dto";
import { TestDatabaseConnectionResponseDTO } from "./dto/test-database-connection-response.dto";

@Injectable()
export class TestDatabaseConnectionUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
    @Inject("DatabaseConnectionTesterFactory")
    private readonly databaseConnectionTesterFactory: DatabaseConnectionTesterFactory,
  ) {}

  async execute(
    data: TestDatabaseConnectionRequestDTO,
  ): Promise<TestDatabaseConnectionResponseDTO> {
    const connection = await this.databaseConnectionRepository.findById(
      data.connectionId,
    );

    if (!connection) {
      throw new DatabaseConnectionNotFoundError(
        "Database connection not found",
      );
    }

    if (data.userId !== connection.userId) {
      throw new DatabaseConnectionNotFoundError(
        "Database connection not found",
      );
    }

    const tester = this.databaseConnectionTesterFactory.get(
      connection.provider,
    );

    const result = await tester.test(connection);

    return result;
  }
}
