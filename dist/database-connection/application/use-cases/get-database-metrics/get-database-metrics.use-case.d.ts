import { GetDatabaseMetricsRequestDTO } from "./dto/get-database-metrics-request.dto";
import { GetDatabaseMetricsResponseDTO } from "./dto/get-database-metrics-response.dto";
import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { DatabaseMetricCollectorFactory } from "../../services/database-metric/database-metric-collector-factory";
import { DatabaseHealthService } from "../../services/database-health/database-health-service";
export declare class GetDatabaseMetricsUseCase {
    private readonly databaseConnectionRepository;
    private readonly databaseMetricCollectorFactory;
    private readonly databaseHealthService;
    private readonly logger;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository, databaseMetricCollectorFactory: DatabaseMetricCollectorFactory, databaseHealthService: DatabaseHealthService);
    execute(data: GetDatabaseMetricsRequestDTO): Promise<GetDatabaseMetricsResponseDTO>;
}
