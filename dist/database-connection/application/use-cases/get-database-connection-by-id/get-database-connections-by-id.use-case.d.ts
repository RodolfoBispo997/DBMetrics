import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { GetDatabaseConnectionByIdRequestDTO } from "./dto/get-database-connection-by-id-request.dto";
import { GetDatabaseConnectionByIdResponseDTO } from "./dto/get-database-connection-by-id-response.dto";
export declare class GetDatabaseConnectionByIdUseCase {
    private readonly databaseConnectionRepository;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository);
    execute(data: GetDatabaseConnectionByIdRequestDTO): Promise<GetDatabaseConnectionByIdResponseDTO>;
}
