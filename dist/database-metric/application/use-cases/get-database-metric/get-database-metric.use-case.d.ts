import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricRepository } from "../../repositories/database-metric-repository";
import { GetDatabaseMetricRequestDTO } from "./dto/get-database-metric-request.dto";
import { GetDatabaseMetricResponseDTO } from "./dto/get-database-metric-response.dto";
export declare class GetDatabaseMetricUseCase {
    private readonly databaseMetricRepository;
    private readonly databaseConnectionRepository;
    constructor(databaseMetricRepository: DatabaseMetricRepository, databaseConnectionRepository: DatabaseConnectionRepository);
    execute(data: GetDatabaseMetricRequestDTO): Promise<GetDatabaseMetricResponseDTO[]>;
}
