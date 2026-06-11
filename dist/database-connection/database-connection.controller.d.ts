import { CreateDatabaseConnectionHttpDTO } from "./presentation/dto/create-database-connection-http.dto";
import { CreateDatabaseConnectionUseCase } from "./application/use-cases/create-database-connection/create-database-connection.use-case";
import { ListDatabaseConnectionsUseCase } from "./application/use-cases/list-database-connections/list-database-connections.use-case";
import { GetDatabaseConnectionByIdUseCase } from "./application/use-cases/get-database-connection-by-id/get-database-connections-by-id.use-case";
import { UpdateDatabaseConnectionUseCase } from "./application/use-cases/update-database-connection/update-database-connection.use-case";
import { UpdateDatabaseConnectionHttpDTO } from "./presentation/dto/update-database-connection-http.dto";
import { DeleteDatabaseConnectionUseCase } from "./application/use-cases/delete-database-connection/delete-database-connection.use-case";
import { TestDatabaseConnectionUseCase } from "./application/use-cases/test-database-connection/test-database-connection.use-case";
export declare class DatabaseConnectionController {
    private readonly createDatabaseConnectionUseCase;
    private readonly listDatabaseConnectionsUseCase;
    private readonly getDatabaseConnectionByIdUseCase;
    private readonly updateDatabaseConnectionUseCase;
    private readonly deleteDatabaseConnectionUseCase;
    private readonly testDatabaseConnectionUseCase;
    constructor(createDatabaseConnectionUseCase: CreateDatabaseConnectionUseCase, listDatabaseConnectionsUseCase: ListDatabaseConnectionsUseCase, getDatabaseConnectionByIdUseCase: GetDatabaseConnectionByIdUseCase, updateDatabaseConnectionUseCase: UpdateDatabaseConnectionUseCase, deleteDatabaseConnectionUseCase: DeleteDatabaseConnectionUseCase, testDatabaseConnectionUseCase: TestDatabaseConnectionUseCase);
    create(body: CreateDatabaseConnectionHttpDTO): Promise<import("./application/use-cases/create-database-connection/dto/create-database-connection-response.dto").CreateDatabaseConnectionResponseDto>;
    list(request: any): Promise<import("./application/use-cases/list-database-connections/dto/list-database-connections-response.dto").ListDatabaseConnectionsResponseDTO[]>;
    findById(request: any, id: string): Promise<import("./application/use-cases/get-database-connection-by-id/dto/get-database-connection-by-id-response.dto").GetDatabaseConnectionByIdResponseDTO>;
    update(request: any, id: string, body: UpdateDatabaseConnectionHttpDTO): Promise<import("./application/use-cases/update-database-connection/dto/update-database-connection-response.dto").UpdateDatabaseConnectionResponseDTO>;
    delete(request: any, id: string): Promise<void>;
    test(request: any, connectionId: string): Promise<import("./application/use-cases/test-database-connection/dto/test-database-connection-response.dto").TestDatabaseConnectionResponseDTO>;
}
