import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { ListDatabaseConnectionsRequestDTO } from "./dto/list-database-connections-request.dto";
import { ListDatabaseConnectionsResponseDTO } from "./dto/list-database-connections-response.dto";
export declare class ListDatabaseConnectionsUseCase {
    private readonly databaseConnectionRepository;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository);
    execute(data: ListDatabaseConnectionsRequestDTO): Promise<ListDatabaseConnectionsResponseDTO[]>;
}
