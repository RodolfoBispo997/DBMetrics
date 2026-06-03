import { DatabaseConnectionRepository } from "../../application/repositories/database-connection-repository";
import { DatabaseConnection } from "../../domain/entities/database-connection";
export declare class PrismaDatabaseConnectionRepository implements DatabaseConnectionRepository {
    save(connection: DatabaseConnection): Promise<void>;
}
