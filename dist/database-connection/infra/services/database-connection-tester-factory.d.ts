import { DatabaseConnectionTester } from "../../application/services/database-connection-tester";
import { DatabaseConnectionTesterFactory } from "../../application/services/database-connection-tester-factory";
import { DatabaseProvider } from "../../domain/enums/database-provider.enum";
import { MysqlConnectionTester } from "./mysql-connection-tester";
import { PostgresConnectionTester } from "./postgres-connection-tester";
export declare class DatabaseConnectionTesterFactoryImpl implements DatabaseConnectionTesterFactory {
    private readonly postgresConnectionTester;
    private readonly mysqlConnectionTester;
    constructor(postgresConnectionTester: PostgresConnectionTester, mysqlConnectionTester: MysqlConnectionTester);
    get(provider: DatabaseProvider): DatabaseConnectionTester;
}
