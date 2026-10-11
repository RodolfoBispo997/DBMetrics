import { Inject, Injectable, Logger } from "@nestjs/common";
import { GetDatabaseMetricsRequestDTO } from "./dto/get-database-metrics-request.dto";
import { GetDatabaseMetricsResponseDTO } from "./dto/get-database-metrics-response.dto";
import { DatabaseConnectionNotFoundError } from "../../../domain/errors/database-connection-not-found-error";
import { DatabaseConnectionForbiddenError } from "../../../domain/errors/database-connection-forbidden-error";
import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { DatabaseMetricCollectorFactory } from "../../services/database-metric/database-metric-collector-factory";
import { DatabaseHealthService } from "../../services/database-health/database-health-service";

@Injectable()
export class GetDatabaseMetricsUseCase {
  private readonly logger = new Logger(GetDatabaseMetricsUseCase.name);

  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,

    @Inject("DatabaseMetricCollectorFactory")
    private readonly databaseMetricCollectorFactory: DatabaseMetricCollectorFactory,

    @Inject("DatabaseHealthService")
    private readonly databaseHealthService: DatabaseHealthService,
  ) {}

  async execute(
    data: GetDatabaseMetricsRequestDTO,
  ): Promise<GetDatabaseMetricsResponseDTO> {
    const connection = await this.databaseConnectionRepository.findById(
      data.connectionId,
    );

    if (!connection) {
      throw new DatabaseConnectionNotFoundError("Database connection not found");
    }

    if (data.userId !== connection.userId) {
      throw new DatabaseConnectionForbiddenError();
    }

    const collector = this.databaseMetricCollectorFactory.get(
      connection.provider,
    );

    try {
      const metrics = await collector.collect(connection);

      const health = this.databaseHealthService.evaluate(metrics);

      return {
        ...metrics,
        health,
      };
    } catch {
      this.logger.error("Database metrics collection failed");
      return {
        databaseVersion: "",
        tablesCount: 0,
        viewsCount: 0,
        schemasCount: 0,
        indexesCount: 0,
        functionsCount: 0,
        databaseSize: 0,
        activeConnections: 0,

        health: {
          status: "OFFLINE",
          message:
            "Database unavailable",
          checkedAt: new Date(),
        },
      };
    }
  }
}
