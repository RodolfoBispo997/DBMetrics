import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseConnectionNotFoundError } from "../../../../database-connection/domain/errors/database-connection-not-found-error";
import { RecordDatabaseMetricUseCase } from "../record-database-metric/record-database-metric.use-case";

@Injectable()
export class CollectDatabaseMetricUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,

    private readonly recordDatabaseMetricUseCase: RecordDatabaseMetricUseCase,
  ) {}

  async execute(data: CollectDatabaseMetricRequestDTO): Promise<void> {
    const connection = await this.databaseConnectionRepository.findById(
      data.connectionId,
    );

    if (!connection) {
      throw new DatabaseConnectionNotFoundError(
        "Database connection not found",
      );
    }

    if (connection.userId !== data.userId) {
      throw new DatabaseConnectionNotFoundError(
        "Database connection not found",
      );
    }

    await this.recordDatabaseMetricUseCase.execute(connection);
  }
}
