import { CreateDatabaseConnectionHttpDTO } from "./presentation/dto/create-database-connection-http.dto";
import { CreateDatabaseConnectionUseCase } from "./application/use-cases/create-database-connection/create-database-connection.use-case";
import { ListDatabaseConnectionsUseCase } from "./application/use-cases/list-database-connections/list-database-connections.use-case";
import { GetDatabaseConnectionByIdUseCase } from "./application/use-cases/get-database-connection-by-id/get-database-connections-by-id.use-case";
import { UpdateDatabaseConnectionUseCase } from "./application/use-cases/update-database-connection/update-database-connection.use-case";
import { UpdateDatabaseConnectionHttpDTO } from "./presentation/dto/update-database-connection-http.dto";
export declare class DatabaseConnectionController {
    private readonly createDatabaseConnectionUseCase;
    private readonly listDatabaseConnectionsUseCase;
    private readonly getDatabaseConnectionByIdUseCase;
    private readonly updateDatabaseConnectionUseCase;
    constructor(createDatabaseConnectionUseCase: CreateDatabaseConnectionUseCase, listDatabaseConnectionsUseCase: ListDatabaseConnectionsUseCase, getDatabaseConnectionByIdUseCase: GetDatabaseConnectionByIdUseCase, updateDatabaseConnectionUseCase: UpdateDatabaseConnectionUseCase);
    create(body: CreateDatabaseConnectionHttpDTO): Promise<import("./application/use-cases/create-database-connection/dto/create-database-connection-response.dto").CreateDatabaseConnectionResponseDto>;
    list(request: any): Promise<import("./application/use-cases/list-database-connections/dto/list-database-connections-response.dto").ListDatabaseConnectionsResponseDTO[]>;
    findById(request: any, id: string): Promise<import("./application/use-cases/get-database-connection-by-id/dto/get-database-connection-by-id-response.dto").GetDatabaseConnectionByIdResponseDTO>;
    update(request: any, id: string, body: UpdateDatabaseConnectionHttpDTO): Promise<import("./application/use-cases/update-database-connection/dto/update-database-connection-response.dto").UpdateDatabaseConnectionResponseDTO>;
}
