import { CollectDatabaseMetricsUseCase } from "../../application/use-cases/collect-database-metrics/collect-database-metrics.use-case";
export declare class DatabaseMetricScheduler {
    private readonly collectDatabaseMetricsUseCase;
    private readonly logger;
    constructor(collectDatabaseMetricsUseCase: CollectDatabaseMetricsUseCase);
    handleDatabaseMetricsCollection(): Promise<void>;
}
