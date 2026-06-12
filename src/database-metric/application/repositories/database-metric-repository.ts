import { DatabaseMetrics } from "../../domain/entities/database-metric";

export interface DatabaseMetricRepository {
  save(metric: DatabaseMetrics): Promise<void>;
}
