import { DatabaseConnection } from "../../../domain/entities/database-connection";
import { DatabaseMetrics } from "../../types/database-metrics.type";
export interface DatabaseMetricCollector {
    collect(connection: DatabaseConnection): Promise<DatabaseMetrics>;
}
