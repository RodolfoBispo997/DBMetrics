import { DatabaseConnection } from "../../../domain/entities/database-connection";
import { DatabaseMetricData } from "../../types/database-metric-data.type";
export interface DatabaseMetricCollector {
    collect(connection: DatabaseConnection): Promise<DatabaseMetricData>;
}
