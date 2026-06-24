import { DatabaseMetrics } from "../../domain/entities/database-metric";
export interface DatabaseMetricRepository {
    save(metric: DatabaseMetrics): Promise<void>;
    findByConnectionId(connectionId: string): Promise<DatabaseMetrics[]>;
    findHistoryByConnectionId(data: {
        connectionId: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<DatabaseMetrics[]>;
    findLatestByConnectionId(connectionId: string): Promise<DatabaseMetrics | null>;
}
