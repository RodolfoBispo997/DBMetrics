import { DatabaseConnectionTester } from "../../application/services/database-connection-tester";
import { DatabaseConnection } from "../../domain/entities/database-connection";
export declare class PostgresConnectionTester implements DatabaseConnectionTester {
    test(connection: DatabaseConnection): Promise<{
        success: boolean;
        message: string;
    }>;
    private translateError;
}
