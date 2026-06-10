import { DatabaseConnection } from "../../domain/entities/database-connection";
export interface DatabaseConnectionRepository {
    save(connection: DatabaseConnection): Promise<void>;
    findManyByUserId(userId: string): Promise<DatabaseConnection[]>;
    findById(id: string): Promise<DatabaseConnection | null>;
    update(connection: DatabaseConnection): Promise<void>;
    delete(id: string): Promise<void>;
}
