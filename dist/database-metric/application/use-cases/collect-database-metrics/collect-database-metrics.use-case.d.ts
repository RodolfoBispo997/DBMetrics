import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { RecordDatabaseMetricUseCase } from "../record-database-metric/record-database-metric.use-case";
import { CollectDatabaseMetricsResponseDTO } from "./dto/collect-database-metrics-response.dto";
export declare class CollectDatabaseMetricsUseCase {
    private readonly databaseConnectionRepository;
    private readonly recordDatabaseMetricUseCase;
    private readonly logger;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository, recordDatabaseMetricUseCase: RecordDatabaseMetricUseCase);
    execute(): Promise<CollectDatabaseMetricsResponseDTO>;
}
