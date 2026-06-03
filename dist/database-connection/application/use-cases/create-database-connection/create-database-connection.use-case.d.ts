import { UserRepository } from "../../../../user/application/repositories/user-repository";
import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { CreateDatabaseConnectionRequestDto } from "./dto/create-database-connection-request.dto";
import { CreateDatabaseConnectionResponseDto } from "./dto/create-database-connection-response.dto";
export declare class CreateDatabaseConnectionUseCase {
    private readonly databaseConnectionRepository;
    private readonly userRepository;
    constructor(databaseConnectionRepository: DatabaseConnectionRepository, userRepository: UserRepository);
    execute(data: CreateDatabaseConnectionRequestDto): Promise<CreateDatabaseConnectionResponseDto>;
}
