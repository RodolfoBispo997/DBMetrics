import { DatabaseHealth } from "../../types/database-health.type";
import { DatabaseMetricData } from "../../types/database-metric-data.type";

export interface DatabaseHealthService {
  evaluate(metrics: DatabaseMetricData): DatabaseHealth;
}
