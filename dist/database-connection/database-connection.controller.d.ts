import { CreateDatabaseConnectionHttpDTO } from "./presentation/dto/create-database-connection-http.dto";
import { CreateDatabaseConnectionUseCase } from "./application/use-cases/create-database-connection/create-database-connection.use-case";
import { ListDatabaseConnectionsUseCase } from "./application/use-cases/list-database-connections/list-database-connections.use-case";
import { GetDatabaseConnectionByIdUseCase } from "./application/use-cases/get-database-connection-by-id/get-database-connections-by-id.use-case";
export declare class DatabaseConnectionController {
    private readonly createDatabaseConnectionUseCase;
    private readonly listDatabaseConnectionsUseCase;
    private readonly getDatabaseConnectionByIdUseCase;
    constructor(createDatabaseConnectionUseCase: CreateDatabaseConnectionUseCase, listDatabaseConnectionsUseCase: ListDatabaseConnectionsUseCase, getDatabaseConnectionByIdUseCase: GetDatabaseConnectionByIdUseCase);
    create(body: CreateDatabaseConnectionHttpDTO): Promise<import("./application/use-cases/create-database-connection/dto/create-database-connection-response.dto").CreateDatabaseConnectionResponseDto>;
    list(request: any): Promise<import("./application/use-cases/list-database-connections/dto/list-database-connections-response.dto").ListDatabaseConnectionsResponseDTO[]>;
    findById(request: any, id: string): Promise<import("./application/use-cases/get-database-connection-by-id/dto/get-database-connection-by-id-response.dto").GetDatabaseConnectionByIdResponseDTO>;
}
