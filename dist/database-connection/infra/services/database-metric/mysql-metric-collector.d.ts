import { DatabaseMetricCollector } from "../../../application/services/database-metric/database-metric-collector";
import { DatabaseMetrics } from "../../../application/types/database-metrics.type";
import { DatabaseConnection } from "../../../domain/entities/database-connection";
export declare class MysqlMetricCollector implements DatabaseMetricCollector {
    collect(connection: DatabaseConnection): Promise<DatabaseMetrics>;
}
