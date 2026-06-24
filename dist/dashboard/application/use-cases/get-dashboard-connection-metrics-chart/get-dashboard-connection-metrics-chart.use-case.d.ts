import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../../../database-metric/application/repositories/database-metric-repository";
import { GetDashboardConnectionMetricsChartRequestDTO } from "./dto/get-dashboard-connection-metrics-chart-request.dto";
import { GetDashboardConnectionMetricsChartResponseDTO } from "./dto/get-dashboard-connection-metrics-chart-response.dto";
export declare class GetDashboardConnectionMetricsChartUseCase {
    private readonly databaseConnectionRepository;
    private readonly databaseMetricRepository;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository, databaseMetricRepository: DatabaseMetricRepository);
    execute(data: GetDashboardConnectionMetricsChartRequestDTO): Promise<GetDashboardConnectionMetricsChartResponseDTO>;
}
