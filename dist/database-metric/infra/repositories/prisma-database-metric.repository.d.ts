import { DatabaseMetricRepository } from "../../application/repositories/database-metric-repository";
import { DatabaseMetrics } from "../../domain/entities/database-metric";
export declare class PrismaDatabaseMetricRepository implements DatabaseMetricRepository {
    findByConnectionId(connectionId: string): Promise<DatabaseMetrics[]>;
    findHistoryByConnectionId(data: {
        connectionId: string;
        startDate: Date;
        endDate: Date;
    }): Promise<DatabaseMetrics[]>;
    findLatestByConnectionId(connectionId: string): Promise<DatabaseMetrics | null>;
    save(metric: DatabaseMetrics): Promise<void>;
}
