import { Module } from "@nestjs/common";
import { DatabaseConnectionController } from "./database-connection.controller";
import { CreateDatabaseConnectionUseCase } from "./application/use-cases/create-database-connection/create-database-connection.use-case";
import { PrismaDatabaseConnectionRepository } from "./infra/repositories/prisma-database-connection.repository";
import { PrismaUserRepository } from "../user/infra/repositories/prisma-user.repository";
import { ListDatabaseConnectionsUseCase } from "./application/use-cases/list-database-connections/list-database-connections.use-case";
import { GetDatabaseConnectionByIdUseCase } from "./application/use-cases/get-database-connection-by-id/get-database-connections-by-id.use-case";
import { UpdateDatabaseConnectionUseCase } from "./application/use-cases/update-database-connection/update-database-connection.use-case";
import { DeleteDatabaseConnectionUseCase } from "./application/use-cases/delete-database-connection/delete-database-connection.use-case";
import { TestDatabaseConnectionUseCase } from "./application/use-cases/test-database-connection/test-database-connection.use-case";
import { DatabaseConnectionTesterFactoryImpl } from "./infra/services/database-connection-tester-factory";
import { PostgresConnectionTester } from "./infra/services/postgres-connection-tester";
import { MysqlConnectionTester } from "./infra/services/mysql-connection-tester";
import { DatabaseMetricCollectorFactoryImpl } from "./infra/services/database-metric/database-metric-collector-factory";
import { GetDatabaseMetricsUseCase } from "./application/use-cases/get-database-metrics/get-database-metrics.use-case";
import { PostgresMetricCollector } from "./infra/services/database-metric/postgres-metric-collector";
import { MysqlMetricCollector } from "./infra/services/database-metric/mysql-metric-collector";
import { DatabaseHealthServiceImpl } from "./infra/services/database-health/database-health.service";

@Module({
  controllers: [DatabaseConnectionController],
  providers: [
    CreateDatabaseConnectionUseCase,
    ListDatabaseConnectionsUseCase,
    GetDatabaseConnectionByIdUseCase,
    UpdateDatabaseConnectionUseCase,
    DeleteDatabaseConnectionUseCase,
    TestDatabaseConnectionUseCase,
    GetDatabaseMetricsUseCase,
    DatabaseMetricCollectorFactoryImpl,
    PostgresMetricCollector,
    MysqlMetricCollector,

    PostgresConnectionTester,
    MysqlConnectionTester,

    {
      provide: "DatabaseConnectionRepository",
      useClass: PrismaDatabaseConnectionRepository,
    },

    {
      provide: "UserRepository",
      useClass: PrismaUserRepository,
    },

    {
      provide: "DatabaseConnectionTesterFactory",
      useClass: DatabaseConnectionTesterFactoryImpl,
    },

    {
      provide: "DatabaseMetricCollectorFactory",
      useClass: DatabaseMetricCollectorFactoryImpl,
    },
    {
      provide: "DatabaseHealthService",
      useClass: DatabaseHealthServiceImpl,
    },
  ],
  exports: ["DatabaseHealthService"],
})
export class DatabaseConnectionModule {}
