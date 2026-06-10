import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { DeleteDatabaseConnectionRequestDTO } from "./dto/delete-database-connection-request.dto";
export declare class DeleteDatabaseConnectionUseCase {
    private readonly databaseConnectionRepository;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository);
    execute(data: DeleteDatabaseConnectionRequestDTO): Promise<void>;
}
