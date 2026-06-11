import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { DatabaseConnectionTesterFactory } from "../../services/database-connection-tester-factory";
import { TestDatabaseConnectionRequestDTO } from "./dto/test-database-connection-request.dto";
import { TestDatabaseConnectionResponseDTO } from "./dto/test-database-connection-response.dto";
export declare class TestDatabaseConnectionUseCase {
    private readonly databaseConnectionRepository;
    private readonly databaseConnectionTesterFactory;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository, databaseConnectionTesterFactory: DatabaseConnectionTesterFactory);
    execute(data: TestDatabaseConnectionRequestDTO): Promise<TestDatabaseConnectionResponseDTO>;
}
