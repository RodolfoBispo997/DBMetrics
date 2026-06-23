import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../../../database-metric/application/repositories/database-metric-repository";
import { GetDashboardOverviewRequestDTO } from "./dto/get-dashboard-overview-request.dto";
import { GetDashboardOverviewResponseDTO } from "./dto/get-dashboard-overview-response.dto";
import { DashboardConnectionOverview } from "../../types/dashboard-overview.type";

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
          const metrics =
            await this.databaseMetricRepository.findByConnectionId(
              connection.id,
            );

          const lastMetric = metrics[0] ?? null;

          return {
            connectionId: connection.id,
            name: connection.name,
            provider: connection.provider,
            database: connection.database,
            lastMetric: lastMetric
              ? {
                  databaseVersion: lastMetric.databaseVersion,
                  tablesCount: lastMetric.tablesCount,
                  databaseSize: lastMetric.databaseSize,
                  activeConnections: lastMetric.activeConnections,
                  collectedAt: lastMetric.createdAt,
                }
              : null,
          };
        }),
      );

    const summary = connectionOverviews.reduce(
      (acc, connection) => {
        if (!connection.lastMetric) {
          return acc;
        }

        acc.totalDatabaseSize += connection.lastMetric.databaseSize;
        acc.totalActiveConnections += connection.lastMetric.activeConnections;

        return acc;
      },
      {
        totalConnections: connections.length,
        totalDatabaseSize: 0,
        totalActiveConnections: 0,
      },
    );

    return {
      summary,
      connections: connectionOverviews,
    };
  }
}
