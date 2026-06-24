import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../../../database-metric/application/repositories/database-metric-repository";
import { GetDashboardConnectionMetricsHistoryRequestDTO } from "./dto/get-dashboard-connection-metrics-history-request.dto";
import { GetDashboardConnectionMetricsHistoryResponseDTO } from "./dto/get-dashboard-connection-metrics-history-response.dto";
export declare class GetDashboardConnectionMetricsHistoryUseCase {
    private readonly databaseConnectionRepository;
    private readonly databaseMetricRepository;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository, databaseMetricRepository: DatabaseMetricRepository);
    execute(data: GetDashboardConnectionMetricsHistoryRequestDTO): Promise<GetDashboardConnectionMetricsHistoryResponseDTO>;
}
