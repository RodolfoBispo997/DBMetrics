import { DatabaseMetricCollector } from "../../../application/services/database-metric/database-metric-collector";
import { DatabaseMetricCollectorFactory } from "../../../application/services/database-metric/database-metric-collector-factory";
import { DatabaseProvider } from "../../../domain/enums/database-provider.enum";
import { MysqlMetricCollector } from "./mysql-metric-collector";
import { PostgresMetricCollector } from "./postgres-metric-collector";
export declare class DatabaseMetricCollectorFactoryImpl implements DatabaseMetricCollectorFactory {
    private readonly postgresMetricCollector;
    private readonly mysqlMetricCollector;
    constructor(postgresMetricCollector: PostgresMetricCollector, mysqlMetricCollector: MysqlMetricCollector);
    get(provider: DatabaseProvider): DatabaseMetricCollector;
}
