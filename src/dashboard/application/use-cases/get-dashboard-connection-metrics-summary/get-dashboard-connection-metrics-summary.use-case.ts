import { Inject, Injectable } from "@nestjs/common";

import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../../../database-metric/application/repositories/database-metric-repository";

import { DatabaseConnectionNotFoundError } from "../../../../database-connection/domain/errors/database-connection-not-found-error";

import { GetDashboardConnectionMetricsSummaryRequestDTO } from "./dto/get-dashboard-connection-metrics-summary-request.dto";
import { GetDashboardConnectionMetricsSummaryResponseDTO } from "./dto/get-dashboard-connection-metrics-summary-response.dto";

const DASHBOARD_SUMMARY_PERIOD_HOURS = 24;

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

    const endDate = new Date();

    const startDate = new Date();

    startDate.setHours(startDate.getHours() - DASHBOARD_SUMMARY_PERIOD_HOURS);

    const history =
      await this.databaseMetricRepository.findHistoryByConnectionId({
        connectionId: connection.id,
        startDate,
        endDate,
      });

    if (history.length === 0) {
      return {
        connectionId: connection.id,
        current: null,
        growth: null,
      };
    }

    // history is ordered by createdAt DESC
    const latest = history[0];
    const oldest = history[history.length - 1];

    return {
      connectionId: connection.id,

      current: {
        databaseVersion: latest.databaseVersion,

        tablesCount: latest.tablesCount,
        viewsCount: latest.viewsCount,
        schemasCount: latest.schemasCount,
        indexesCount: latest.indexesCount,
        functionsCount: latest.functionsCount,

        databaseSize: latest.databaseSize,
        activeConnections: latest.activeConnections,

        collectedAt: latest.createdAt,
      },

      growth: {
        databaseSize: latest.databaseSize - oldest.databaseSize,

        tablesCount: latest.tablesCount - oldest.tablesCount,
        viewsCount: latest.viewsCount - oldest.viewsCount,
        schemasCount: latest.schemasCount - oldest.schemasCount,
        indexesCount: latest.indexesCount - oldest.indexesCount,
        functionsCount: latest.functionsCount - oldest.functionsCount,

        activeConnections: latest.activeConnections - oldest.activeConnections,
      },
    };
  }
}
