import { DatabaseConnection } from "../../../domain/entities/database-connection";
import { DatabaseMetric } from "../../types/database-metrics.type";
export interface DatabaseMetricCollector {
    collect(connection: DatabaseConnection): Promise<DatabaseMetric>;
}
