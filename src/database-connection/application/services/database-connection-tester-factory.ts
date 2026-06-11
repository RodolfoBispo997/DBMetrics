import { DatabaseProvider } from "../../domain/enums/database-provider.enum";
import { DatabaseConnectionTester } from "./database-connection-tester";

export interface DatabaseConnectionTesterFactory {
  get(provider: DatabaseProvider): DatabaseConnectionTester;
}
