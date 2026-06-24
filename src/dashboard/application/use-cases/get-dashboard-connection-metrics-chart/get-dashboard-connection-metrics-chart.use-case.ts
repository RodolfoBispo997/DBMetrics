import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../../../database-metric/application/repositories/database-metric-repository";
import { DatabaseConnectionNotFoundError } from "../../../../database-connection/domain/errors/database-connection-not-found-error";
import { GetDashboardConnectionMetricsChartRequestDTO } from "./dto/get-dashboard-connection-metrics-chart-request.dto";
import { GetDashboardConnectionMetricsChartResponseDTO } from "./dto/get-dashboard-connection-metrics-chart-response.dto";
import { resolveDashboardDateRange } from "../../utils/resolve-dashboard-date-range";

@Injectable()
export class GetDashboardConnectionMetricsChartUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,

    @Inject("DatabaseMetricRepository")
    private readonly databaseMetricRepository: DatabaseMetricRepository,
  ) {}

  async execute(
    data: GetDashboardConnectionMetricsChartRequestDTO,
  ): Promise<GetDashboardConnectionMetricsChartResponseDTO> {
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

    const sortedMetrics = [...metrics].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    return {
      connectionId: connection.id,
      charts: {
        databaseSize: sortedMetrics.map((metric) => ({
          collectedAt: metric.createdAt,
          value: metric.databaseSize,
        })),
        activeConnections: sortedMetrics.map((metric) => ({
          collectedAt: metric.createdAt,
          value: metric.activeConnections,
        })),
        tablesCount: sortedMetrics.map((metric) => ({
          collectedAt: metric.createdAt,
          value: metric.tablesCount,
        })),
      },
    };
  }
}
