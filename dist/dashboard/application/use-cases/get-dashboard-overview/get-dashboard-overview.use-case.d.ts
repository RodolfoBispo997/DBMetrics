import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../../../database-metric/application/repositories/database-metric-repository";
import { GetDashboardOverviewRequestDTO } from "./dto/get-dashboard-overview-request.dto";
import { GetDashboardOverviewResponseDTO } from "./dto/get-dashboard-overview-response.dto";
export declare class GetDashboardOverviewUseCase {
    private readonly databaseConnectionRepository;
    private readonly databaseMetricRepository;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository, databaseMetricRepository: DatabaseMetricRepository);
    execute(data: GetDashboardOverviewRequestDTO): Promise<GetDashboardOverviewResponseDTO>;
}
