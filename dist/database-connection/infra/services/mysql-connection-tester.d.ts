import { DatabaseConnection } from "../../domain/entities/database-connection";
import { DatabaseConnectionTester } from "../../application/services/database-connection-tester";
export declare class MysqlConnectionTester implements DatabaseConnectionTester {
    test(connection: DatabaseConnection): Promise<{
        success: boolean;
        message: string;
    }>;
    private translateError;
}
