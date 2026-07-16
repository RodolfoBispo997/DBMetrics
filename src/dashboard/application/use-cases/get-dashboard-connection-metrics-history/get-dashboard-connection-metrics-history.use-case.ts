import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../../../database-metric/application/repositories/database-metric-repository";
import { GetDashboardConnectionMetricsHistoryRequestDTO } from "./dto/get-dashboard-connection-metrics-history-request.dto";
import { GetDashboardConnectionMetricsHistoryResponseDTO } from "./dto/get-dashboard-connection-metrics-history-response.dto";
import { DatabaseConnectionNotFoundError } from "../../../../database-connection/domain/errors/database-connection-not-found-error";
import { resolveDashboardDateRange } from "../../utils/resolve-dashboard-date-range";
import { InvalidDashboardHistoryLimitError } from "../../errors/invalid-dashboard-history-limit-error";

// Seven days of snapshots at the intended five-minute collection frequency.
export const DASHBOARD_HISTORY_DEFAULT_LIMIT = 2_016;
export const DASHBOARD_HISTORY_MIN_LIMIT = 1;
// Covers seven days at the former 30-second development frequency.
export const DASHBOARD_HISTORY_MAX_LIMIT = 20_160;

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
    const limit = resolveHistoryLimit(data.limit);

    const snapshots =
      await this.databaseMetricRepository.findHistoryByConnectionId({
        connectionId: connection.id,
        startDate,
        endDate,
        order: "desc",
        limit,
      });

    return {
      connectionId: connection.id,

      history: snapshots.map((metric) => ({
        id: metric.id,

        databaseVersion: metric.databaseVersion,

        tablesCount: metric.tablesCount,
        viewsCount: metric.viewsCount,
        schemasCount: metric.schemasCount,
        indexesCount: metric.indexesCount,
        functionsCount: metric.functionsCount,

        databaseSize: metric.databaseSize,
        activeConnections: metric.activeConnections,

        collectedAt: metric.createdAt,
      })),
    };
  }
}

function resolveHistoryLimit(value?: string): number {
  if (value === undefined) {
    return DASHBOARD_HISTORY_DEFAULT_LIMIT;
  }

  const limit = Number(value);

  if (
    !Number.isInteger(limit) ||
    limit < DASHBOARD_HISTORY_MIN_LIMIT ||
    limit > DASHBOARD_HISTORY_MAX_LIMIT
  ) {
    throw new InvalidDashboardHistoryLimitError(
      `limit must be an integer between ${DASHBOARD_HISTORY_MIN_LIMIT} and ${DASHBOARD_HISTORY_MAX_LIMIT}`,
    );
  }

  return limit;
}
