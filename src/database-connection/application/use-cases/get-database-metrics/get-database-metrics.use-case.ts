import { Inject, Injectable } from "@nestjs/common";
import { GetDatabaseMetricsRequestDTO } from "./dto/get-database-metrics-request.dto";
import { GetDatabaseMetricsResponseDTO } from "./dto/get-database-metrics-response.dto";
import { DatabaseConnectionNotFoundError } from "../../../domain/errors/database-connection-not-found-error";
import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { DatabaseMetricCollectorFactory } from "../../services/database-metric/database-metric-collector-factory";

@Injectable()
export class GetDatabaseMetricsUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,

    @Inject("DatabaseMetricCollectorFactory")
    private readonly databaseMetricCollectorFactory: DatabaseMetricCollectorFactory,
  ) {}

  async execute(
    data: GetDatabaseMetricsRequestDTO,
  ): Promise<GetDatabaseMetricsResponseDTO> {
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

    const collector = this.databaseMetricCollectorFactory.get(
      connection.provider,
    );

    const result = await collector.collect(connection);

    return result;
  }
}
