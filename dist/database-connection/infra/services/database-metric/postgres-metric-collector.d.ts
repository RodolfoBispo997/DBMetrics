import { DatabaseMetricCollector } from "../../../application/services/database-metric/database-metric-collector";
import { DatabaseConnection } from "../../../domain/entities/database-connection";
import { DatabaseMetricData } from "../../../application/types/database-metric-data.type";
export declare class PostgresMetricCollector implements DatabaseMetricCollector {
    collect(connection: DatabaseConnection): Promise<DatabaseMetricData>;
}
