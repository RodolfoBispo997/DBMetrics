import { CreateDatabaseConnectionHttpDTO } from "./presentation/dto/create-database-connection-http.dto";
import { CreateDatabaseConnectionUseCase } from "./application/use-cases/create-database-connection/create-database-connection.use-case";
export declare class DatabaseConnectionController {
    private readonly createDatabaseConnectionUseCase;
    constructor(createDatabaseConnectionUseCase: CreateDatabaseConnectionUseCase);
    create(body: CreateDatabaseConnectionHttpDTO): Promise<import("./application/use-cases/create-database-connection/dto/create-database-connection-response.dto").CreateDatabaseConnectionResponseDto>;
}
