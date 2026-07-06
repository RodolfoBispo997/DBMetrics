import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../../../database-metric/application/repositories/database-metric-repository";
import { GetDashboardOverviewRequestDTO } from "./dto/get-dashboard-overview-request.dto";
import { GetDashboardOverviewResponseDTO } from "./dto/get-dashboard-overview-response.dto";
import {
  DashboardConnectionOverview,
  DashboardSummary,
} from "../../types/dashboard-overview.type";

@Injectable()
export class GetDashboardOverviewUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,

    @Inject("DatabaseMetricRepository")
    private readonly databaseMetricRepository: DatabaseMetricRepository,
  ) {}

  async execute(
    data: GetDashboardOverviewRequestDTO,
  ): Promise<GetDashboardOverviewResponseDTO> {
    const connections =
      await this.databaseConnectionRepository.findManyByUserId(data.userId);

    const connectionOverviews: DashboardConnectionOverview[] =
      await Promise.all(
        connections.map(async (connection) => {
          const lastMetric =
            await this.databaseMetricRepository.findLatestByConnectionId(
              connection.id,
            );

          return {
            connectionId: connection.id,
            name: connection.name,
            provider: connection.provider,
            database: connection.database,
            lastMetric: lastMetric
              ? {
                  databaseVersion: lastMetric.databaseVersion,

                  tablesCount: lastMetric.tablesCount,
                  viewsCount: lastMetric.viewsCount,
                  schemasCount: lastMetric.schemasCount,
                  indexesCount: lastMetric.indexesCount,
                  functionsCount: lastMetric.functionsCount,

                  databaseSize: lastMetric.databaseSize,
                  activeConnections: lastMetric.activeConnections,

                  collectedAt: lastMetric.createdAt,
                }
              : null,
          };
        }),
      );

    const summary = connectionOverviews.reduce<DashboardSummary>(
      (acc, connection) => {
        const metric = connection.lastMetric;

        if (!metric) {
          return acc;
        }

        acc.totalDatabaseSize += metric.databaseSize;
        acc.totalActiveConnections += metric.activeConnections;

        acc.totalTables += metric.tablesCount;
        acc.totalViews += metric.viewsCount;
        acc.totalSchemas += metric.schemasCount;
        acc.totalIndexes += metric.indexesCount;
        acc.totalFunctions += metric.functionsCount;

        return acc;
      },
      {
        totalConnections: connections.length,

        totalDatabaseSize: 0,
        totalActiveConnections: 0,

        totalTables: 0,
        totalViews: 0,
        totalSchemas: 0,
        totalIndexes: 0,
        totalFunctions: 0,
      },
    );

    return {
      summary,
      connections: connectionOverviews,
    };
  }
}
