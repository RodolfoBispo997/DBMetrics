import { GetDatabaseMetricsRequestDTO } from "./dto/get-database-metrics-request.dto";
import { GetDatabaseMetricsResponseDTO } from "./dto/get-database-metrics-response.dto";
import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { DatabaseMetricCollectorFactory } from "../../services/database-metric/database-metric-collector-factory";
export declare class GetDatabaseMetricsUseCase {
    private readonly databaseConnectionRepository;
    private readonly databaseMetricCollectorFactory;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository, databaseMetricCollectorFactory: DatabaseMetricCollectorFactory);
    execute(data: GetDatabaseMetricsRequestDTO): Promise<GetDatabaseMetricsResponseDTO>;
}
