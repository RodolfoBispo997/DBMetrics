import { DatabaseConnection } from "../../../../database-connection/domain/entities/database-connection";
import { DatabaseMetricCollectorFactory } from "../../../../database-connection/application/services/database-metric/database-metric-collector-factory";
import { DatabaseMetricRepository } from "../../repositories/database-metric-repository";
import { DatabaseMetrics } from "../../../domain/entities/database-metric";
import { AlertProcessorService } from "../../../../alerts/application/services/alert-processor.service";
export declare class RecordDatabaseMetricUseCase {
    private readonly databaseMetricRepository;
    private readonly databaseMetricCollectorFactory;
    private readonly alertProcessor;
    constructor(databaseMetricRepository: DatabaseMetricRepository, databaseMetricCollectorFactory: DatabaseMetricCollectorFactory, alertProcessor: AlertProcessorService);
    execute(connection: DatabaseConnection): Promise<DatabaseMetrics>;
}
