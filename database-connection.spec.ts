import { DatabaseConnection } from "./src/database-connection/domain/entities/database-connection";
import { DatabaseProvider } from "./src/database-connection/domain/enums/database-provider.enum";

async function createDatabase() {
  const connection = DatabaseConnection.create({
    name: "Testando",
    provider: DatabaseProvider.POSTGRESQL,
    host: "localhost",
    port: 5432,
    database: "dbmetrics",
    username: "postgres",
    password: "123456",
    userId: "550e8400-e29b-41d4-a716-446655440000",
  });

  console.log("====>", connection);
}
createDatabase();
