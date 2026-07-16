import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../../../database-metric/application/repositories/database-metric-repository";
import { DatabaseConnectionNotFoundError } from "../../../../database-connection/domain/errors/database-connection-not-found-error";
import { GetDashboardConnectionMetricsChartRequestDTO } from "./dto/get-dashboard-connection-metrics-chart-request.dto";
import {
  DashboardMetricChartPointDTO,
  GetDashboardConnectionMetricsChartResponseDTO,
} from "./dto/get-dashboard-connection-metrics-chart-response.dto";
import { resolveDashboardDateRange } from "../../utils/resolve-dashboard-date-range";
import { DatabaseMetrics } from "../../../../database-metric/domain/entities/database-metric";

@Injectable()
export class GetDashboardConnectionMetricsChartUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,

    @Inject("DatabaseMetricRepository")
    private readonly databaseMetricRepository: DatabaseMetricRepository,
  ) {}

  private buildMetricSeries(
    snapshots: DatabaseMetrics[],
    selector: (snapshot: DatabaseMetrics) => number,
  ): DashboardMetricChartPointDTO[] {
    return snapshots.map((snapshot) => ({
      collectedAt: snapshot.createdAt,
      value: selector(snapshot),
    }));
  }

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

    const snapshots =
      await this.databaseMetricRepository.findHistoryByConnectionId({
        connectionId: connection.id,
        startDate,
        endDate,
        order: "desc",
      });

    const sortedSnapshots = [...snapshots].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    return {
      connectionId: connection.id,
      series: {
        databaseSize: this.buildMetricSeries(
          sortedSnapshots,
          (snapshot) => snapshot.databaseSize,
        ),

        activeConnections: this.buildMetricSeries(
          sortedSnapshots,
          (snapshot) => snapshot.activeConnections,
        ),

        tablesCount: this.buildMetricSeries(
          sortedSnapshots,
          (snapshot) => snapshot.tablesCount,
        ),

        viewsCount: this.buildMetricSeries(
          sortedSnapshots,
          (snapshot) => snapshot.viewsCount,
        ),

        schemasCount: this.buildMetricSeries(
          sortedSnapshots,
          (snapshot) => snapshot.schemasCount,
        ),

        indexesCount: this.buildMetricSeries(
          sortedSnapshots,
          (snapshot) => snapshot.indexesCount,
        ),

        functionsCount: this.buildMetricSeries(
          sortedSnapshots,
          (snapshot) => snapshot.functionsCount,
        ),
      },
    };
  }
}
