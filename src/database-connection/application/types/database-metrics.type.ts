import { DatabaseHealth } from "./database-health.type";
import { DatabaseMetricData } from "./database-metric-data.type";

export type DatabaseMetric = DatabaseMetricData & {
  health: DatabaseHealth;
};
