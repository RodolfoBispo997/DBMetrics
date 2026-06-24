import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../../../database-metric/application/repositories/database-metric-repository";
import { GetDashboardConnectionMetricsHistoryRequestDTO } from "./dto/get-dashboard-connection-metrics-history-request.dto";
import { GetDashboardConnectionMetricsHistoryResponseDTO } from "./dto/get-dashboard-connection-metrics-history-response.dto";
import { DatabaseConnectionNotFoundError } from "../../../../database-connection/domain/errors/database-connection-not-found-error";
import { resolveDashboardDateRange } from "../../utils/resolve-dashboard-date-range";

@Injectable()
export class GetDashboardConnectionMetricsHistoryUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,

    @Inject("DatabaseMetricRepository")
    private readonly databaseMetricRepository: DatabaseMetricRepository,
  ) {}

  async execute(
    data: GetDashboardConnectionMetricsHistoryRequestDTO,
  ): Promise<GetDashboardConnectionMetricsHistoryResponseDTO> {
    const connection = await this.databaseConnectionRepository.findById(
      data.connectionId,
    );

    if (!connection || connection.userId !== data.userId) {
      throw new DatabaseConnectionNotFoundError("Connection not found");
    }

    const { startDate, endDate } = resolveDashboardDateRange({
      startDate: data.startDate,
      endDate: data.endDate,
    });

    const metrics =
      await this.databaseMetricRepository.findHistoryByConnectionId({
        connectionId: connection.id,
        startDate,
        endDate,
      });

    return {
      connectionId: connection.id,
      metrics: metrics.map((metric) => ({
        id: metric.id,
        databaseVersion: metric.databaseVersion,
        tablesCount: metric.tablesCount,
        databaseSize: metric.databaseSize,
        activeConnections: metric.activeConnections,
        collectedAt: metric.createdAt,
      })),
    };
  }
}
