import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { RecordDatabaseMetricUseCase } from "../record-database-metric/record-database-metric.use-case";
export declare class CollectDatabaseMetricUseCase {
    private readonly databaseConnectionRepository;
    private readonly recordDatabaseMetricUseCase;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository, recordDatabaseMetricUseCase: RecordDatabaseMetricUseCase);
    execute(data: CollectDatabaseMetricRequestDTO): Promise<void>;
}
