import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseConnectionNotFoundError } from "../../../../database-connection/domain/errors/database-connection-not-found-error";
import { DatabaseMetricRepository } from "../../repositories/database-metric-repository";
import { GetDatabaseMetricRequestDTO } from "./dto/get-database-metric-request.dto";
import { GetDatabaseMetricResponseDTO } from "./dto/get-database-metric-response.dto";

@Injectable()
export class GetDatabaseMetricUseCase {
  constructor(
    @Inject("DatabaseMetricRepository")
    private readonly databaseMetricRepository: DatabaseMetricRepository,
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
  ) {}

  async execute(
    data: GetDatabaseMetricRequestDTO,
  ): Promise<GetDatabaseMetricResponseDTO[]> {
    const connection = await this.databaseConnectionRepository.findById(
      data.connectionId,
    );

    if (!connection) {
      throw new DatabaseConnectionNotFoundError(
        "Database connection not found",
      );
    }

    if (connection?.userId !== data.userId) {
      throw new DatabaseConnectionNotFoundError(
        "Database connection not found",
      );
    }

    const metric = await this.databaseMetricRepository.findByConnectionId(
      data.connectionId,
    );

    return metric.map((metric) => ({
      id: metric.id,
      databaseVersion: metric.databaseVersion,
      tablesCount: metric.tablesCount,
      viewsCount: metric.viewsCount,
      schemasCount: metric.schemasCount,
      indexesCount: metric.indexesCount,
      functionsCount: metric.functionsCount,
      databaseSize: metric.databaseSize,
      activeConnections: metric.activeConnections,
      createdAt: metric.createdAt,
    }));
  }
}
