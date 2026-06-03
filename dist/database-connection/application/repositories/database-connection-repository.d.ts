import { DatabaseConnection } from "../../domain/entities/database-connection";
export interface DatabaseConnectionRepository {
    save(connection: DatabaseConnection): Promise<void>;
}
