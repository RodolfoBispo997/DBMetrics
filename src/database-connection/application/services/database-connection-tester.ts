import { DatabaseConnection } from "../../domain/entities/database-connection";

export interface DatabaseConnectionTester {
  test(
    connection: DatabaseConnection,
  ): Promise<{ success: boolean; message: string }>;
}
