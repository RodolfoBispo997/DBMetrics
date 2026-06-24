import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../../../database-metric/application/repositories/database-metric-repository";
import { GetDashboardConnectionMetricsSummaryRequestDTO } from "./dto/get-dashboard-connection-metrics-summary-request.dto";
import { GetDashboardConnectionMetricsSummaryResponseDTO } from "./dto/get-dashboard-connection-metrics-summary-response.dto";
export declare class GetDashboardConnectionMetricsSummaryUseCase {
    private readonly databaseConnectionRepository;
    private readonly databaseMetricRepository;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository, databaseMetricRepository: DatabaseMetricRepository);
    execute(data: GetDashboardConnectionMetricsSummaryRequestDTO): Promise<GetDashboardConnectionMetricsSummaryResponseDTO>;
}
