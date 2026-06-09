import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { UpdateDatabaseConnectionRequestDTO } from "./dto/update-database-connection-request.dto";
import { UpdateDatabaseConnectionResponseDTO } from "./dto/update-database-connection-response.dto";
export declare class UpdateDatabaseConnectionUseCase {
    private readonly databaseConnectionRepository;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository);
    execute(data: UpdateDatabaseConnectionRequestDTO): Promise<UpdateDatabaseConnectionResponseDTO>;
}
