import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../../../database-metric/application/repositories/database-metric-repository";
import { GetDashboardOverviewRequestDTO } from "./dto/get-dashboard-overview-request.dto";
import { GetDashboardOverviewResponseDTO } from "./dto/get-dashboard-overview-response.dto";
import {
  DashboardConnectionOverview,
  DashboardSummary,
} from "../../types/dashboard-overview.type";
import { DatabaseHealthService } from "../../../../database-connection/application/services/database-health/database-health-service";

@Injectable()
export class GetDashboardOverviewUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,

    @Inject("DatabaseMetricRepository")
    private readonly databaseMetricRepository: DatabaseMetricRepository,

    @Inject("DatabaseHealthService")
    private readonly databaseHealthService: DatabaseHealthService,
  ) {}

  async execute(
    data: GetDashboardOverviewRequestDTO,
  ): Promise<GetDashboardOverviewResponseDTO> {
    const connections =
      await this.databaseConnectionRepository.findManyByUserId(data.userId);

    const latestMetrics =
      await this.databaseMetricRepository.findLatestByConnectionIds(
        connections.map((connection) => connection.id),
      );

    const connectionOverviews: DashboardConnectionOverview[] = connections.map(
      (connection) => {
        const lastMetric = latestMetrics.get(connection.id) ?? null;
        let health: DashboardConnectionOverview["health"] = null;

        if (lastMetric) {
          const evaluatedHealth = this.databaseHealthService.evaluate(lastMetric);

          if (evaluatedHealth.status !== "OFFLINE") {
            health = {
              status: evaluatedHealth.status,
              message: evaluatedHealth.message,
              checkedAt: lastMetric.createdAt,
            };
          }
        }

        return {
          connectionId: connection.id,
          name: connection.name,
          provider: connection.provider,
          database: connection.database,
          health,
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
      },
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
