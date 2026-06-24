import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../../../database-metric/application/repositories/database-metric-repository";
import { DatabaseConnectionNotFoundError } from "../../../../database-connection/domain/errors/database-connection-not-found-error";
import { GetDashboardConnectionMetricsSummaryRequestDTO } from "./dto/get-dashboard-connection-metrics-summary-request.dto";
import { GetDashboardConnectionMetricsSummaryResponseDTO } from "./dto/get-dashboard-connection-metrics-summary-response.dto";

@Injectable()
export class GetDashboardConnectionMetricsSummaryUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,

    @Inject("DatabaseMetricRepository")
    private readonly databaseMetricRepository: DatabaseMetricRepository,
  ) {}

  async execute(
    data: GetDashboardConnectionMetricsSummaryRequestDTO,
  ): Promise<GetDashboardConnectionMetricsSummaryResponseDTO> {
    const connection = await this.databaseConnectionRepository.findById(
      data.connectionId,
    );

    if (!connection || connection.userId !== data.userId) {
      throw new DatabaseConnectionNotFoundError("Connection not found");
    }

    const metric = await this.databaseMetricRepository.findLatestByConnectionId(
      connection.id,
    );

    if (!metric) {
      return {
        connectionId: connection.id,
        metric: null,
      };
    }

    return {
      connectionId: connection.id,
      metric: {
        id: metric.id,
        databaseVersion: metric.databaseVersion,
        tablesCount: metric.tablesCount,
        databaseSize: metric.databaseSize,
        activeConnections: metric.activeConnections,
        collectedAt: metric.createdAt,
      },
    };
  }
}
