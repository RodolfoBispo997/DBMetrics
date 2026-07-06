import { DatabaseConnection } from "../../../../database-connection/domain/entities/database-connection";
import { DatabaseMetricCollectorFactory } from "../../../../database-connection/application/services/database-metric/database-metric-collector-factory";
import { DatabaseMetricRepository } from "../../repositories/database-metric-repository";
import { DatabaseMetrics } from "../../../domain/entities/database-metric";
export declare class RecordDatabaseMetricUseCase {
    private readonly databaseMetricRepository;
    private readonly databaseMetricCollectorFactory;
    constructor(databaseMetricRepository: DatabaseMetricRepository, databaseMetricCollectorFactory: DatabaseMetricCollectorFactory);
    execute(connection: DatabaseConnection): Promise<DatabaseMetrics>;
}
