import { DatabaseMetricRepository } from "../../application/repositories/database-metric-repository";
import { DatabaseMetrics } from "../../domain/entities/database-metric";
export declare class PrismaDatabaseMetricRepository implements DatabaseMetricRepository {
    save(metric: DatabaseMetrics): Promise<void>;
}
