import { Module } from "@nestjs/common";
import { DatabaseMetricController } from "./database-metric.controller";
import { CollectDatabaseMetricUseCase } from "./application/use-cases/collect-database-metric/collect-database-metric.use-case";
import { PrismaDatabaseMetricRepository } from "./infra/repositories/prisma-database-metric.repository";
import { PrismaDatabaseConnectionRepository } from "../database-connection/infra/repositories/prisma-database-connection.repository";
import { DatabaseMetricCollectorFactoryImpl } from "../database-connection/infra/services/database-metric/database-metric-collector-factory";
import { MysqlMetricCollector } from "../database-connection/infra/services/database-metric/mysql-metric-collector";
import { PostgresMetricCollector } from "../database-connection/infra/services/database-metric/postgres-metric-collector";
import { GetDatabaseMetricUseCase } from "./application/use-cases/get-database-metric/get-database-metric.use-case";
import { RecordDatabaseMetricUseCase } from "./application/use-cases/record-database-metric/record-database-metric.use-case";
import { DatabaseMetricScheduler } from "./infra/scheduler/database-metric.scheduler";
import { CollectDatabaseMetricsUseCase } from "./application/use-cases/collect-database-metrics/collect-database-metrics.use-case";

@Module({
  controllers: [DatabaseMetricController],
  providers: [
    CollectDatabaseMetricUseCase,
    GetDatabaseMetricUseCase,
    RecordDatabaseMetricUseCase,
    DatabaseMetricScheduler,
    CollectDatabaseMetricsUseCase,

    MysqlMetricCollector,
    PostgresMetricCollector,

    {
      provide: "DatabaseMetricRepository",
      useClass: PrismaDatabaseMetricRepository,
    },
    {
      provide: "DatabaseConnectionRepository",
      useClass: PrismaDatabaseConnectionRepository,
    },
    {
      provide: "DatabaseMetricCollectorFactory",
      useClass: DatabaseMetricCollectorFactoryImpl,
    },
  ],
})
export class DatabaseMetricModule {}
