import { DatabaseMetrics } from "../../domain/entities/database-metric";

export interface DatabaseMetricRepository {
  save(metric: DatabaseMetrics): Promise<void>;
  findByConnectionId(connectionId: string): Promise<DatabaseMetrics[]>;
  findHistoryByConnectionId(data: {
    connectionId: string;
    startDate: Date;
    endDate: Date;
    order?: "asc" | "desc";
    limit?: number;
    skip?: number;
  }): Promise<DatabaseMetrics[]>;
  findHistoryCountByConnectionId(data: {
    connectionId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<number>;
  findLatestByConnectionIds(
    connectionIds: string[],
  ): Promise<Map<string, DatabaseMetrics>>;
  findLatestByConnectionId(
    connectionId: string,
  ): Promise<DatabaseMetrics | null>;
}
