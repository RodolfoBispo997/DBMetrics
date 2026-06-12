import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricCollectorFactory } from "../../../../database-connection/application/services/database-metric/database-metric-collector-factory";
import { DatabaseMetricRepository } from "../../repositories/database-metric-repository";
export declare class CollectDatabaseMetricUseCase {
    private readonly databaseMetricRepository;
    private readonly databaseConnectionRepository;
    private readonly databaseMetricCollectorFactory;
    constructor(databaseMetricRepository: DatabaseMetricRepository, databaseConnectionRepository: DatabaseConnectionRepository, databaseMetricCollectorFactory: DatabaseMetricCollectorFactory);
    execute(data: CollectDatabaseMetricRequestDTO): Promise<void>;
}
