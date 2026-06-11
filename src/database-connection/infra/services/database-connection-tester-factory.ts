import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionTester } from "../../application/services/database-connection-tester";
import { DatabaseConnectionTesterFactory } from "../../application/services/database-connection-tester-factory";
import { DatabaseProvider } from "../../domain/enums/database-provider.enum";
import { MysqlConnectionTester } from "./mysql-connection-tester";
import { PostgresConnectionTester } from "./postgres-connection-tester";

@Injectable()
export class DatabaseConnectionTesterFactoryImpl implements DatabaseConnectionTesterFactory {
  constructor(
    private readonly postgresConnectionTester: PostgresConnectionTester,

    private readonly mysqlConnectionTester: MysqlConnectionTester,
  ) {}
  get(provider: DatabaseProvider): DatabaseConnectionTester {
    if (provider === DatabaseProvider.MYSQL) {
      return this.mysqlConnectionTester;
    }

    if (provider === DatabaseProvider.POSTGRESQL) {
      return this.postgresConnectionTester;
    }

    throw new Error("Unsupported database provider");
  }
}
