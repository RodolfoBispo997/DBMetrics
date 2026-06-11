import { Injectable } from "@nestjs/common";
import { DatabaseMetricCollector } from "../../../application/services/database-metric/database-metric-collector";
import { DatabaseMetricCollectorFactory } from "../../../application/services/database-metric/database-metric-collector-factory";
import { DatabaseProvider } from "../../../domain/enums/database-provider.enum";
import { MysqlMetricCollector } from "./mysql-metric-collector";
import { PostgresMetricCollector } from "./postgres-metric-collector";

@Injectable()
export class DatabaseMetricCollectorFactoryImpl implements DatabaseMetricCollectorFactory {
  constructor(
    private readonly postgresMetricCollector: PostgresMetricCollector,
    private readonly mysqlMetricCollector: MysqlMetricCollector,
  ) {}

  get(provider: DatabaseProvider): DatabaseMetricCollector {
    if (provider === DatabaseProvider.POSTGRESQL) {
      return this.postgresMetricCollector;
    }

    if (provider === DatabaseProvider.MYSQL) {
      return this.mysqlMetricCollector;
    }

    throw new Error("Unsupported database provider");
  }
}
