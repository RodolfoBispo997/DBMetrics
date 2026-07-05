"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnectionModule = void 0;
const common_1 = require("@nestjs/common");
const database_connection_controller_1 = require("./database-connection.controller");
const create_database_connection_use_case_1 = require("./application/use-cases/create-database-connection/create-database-connection.use-case");
const prisma_database_connection_repository_1 = require("./infra/repositories/prisma-database-connection.repository");
const prisma_user_repository_1 = require("../user/infra/repositories/prisma-user.repository");
const list_database_connections_use_case_1 = require("./application/use-cases/list-database-connections/list-database-connections.use-case");
const get_database_connections_by_id_use_case_1 = require("./application/use-cases/get-database-connection-by-id/get-database-connections-by-id.use-case");
const update_database_connection_use_case_1 = require("./application/use-cases/update-database-connection/update-database-connection.use-case");
const delete_database_connection_use_case_1 = require("./application/use-cases/delete-database-connection/delete-database-connection.use-case");
const test_database_connection_use_case_1 = require("./application/use-cases/test-database-connection/test-database-connection.use-case");
const database_connection_tester_factory_1 = require("./infra/services/database-connection-tester-factory");
const postgres_connection_tester_1 = require("./infra/services/postgres-connection-tester");
const mysql_connection_tester_1 = require("./infra/services/mysql-connection-tester");
const database_metric_collector_factory_1 = require("./infra/services/database-metric/database-metric-collector-factory");
const get_database_metrics_use_case_1 = require("./application/use-cases/get-database-metrics/get-database-metrics.use-case");
const postgres_metric_collector_1 = require("./infra/services/database-metric/postgres-metric-collector");
const mysql_metric_collector_1 = require("./infra/services/database-metric/mysql-metric-collector");
const database_health_service_1 = require("./infra/services/database-health/database-health.service");
let DatabaseConnectionModule = class DatabaseConnectionModule {
};
exports.DatabaseConnectionModule = DatabaseConnectionModule;
exports.DatabaseConnectionModule = DatabaseConnectionModule = __decorate([
    (0, common_1.Module)({
        controllers: [database_connection_controller_1.DatabaseConnectionController],
        providers: [
            create_database_connection_use_case_1.CreateDatabaseConnectionUseCase,
            list_database_connections_use_case_1.ListDatabaseConnectionsUseCase,
            get_database_connections_by_id_use_case_1.GetDatabaseConnectionByIdUseCase,
            update_database_connection_use_case_1.UpdateDatabaseConnectionUseCase,
            delete_database_connection_use_case_1.DeleteDatabaseConnectionUseCase,
            test_database_connection_use_case_1.TestDatabaseConnectionUseCase,
            get_database_metrics_use_case_1.GetDatabaseMetricsUseCase,
            database_metric_collector_factory_1.DatabaseMetricCollectorFactoryImpl,
            postgres_metric_collector_1.PostgresMetricCollector,
            mysql_metric_collector_1.MysqlMetricCollector,
            postgres_connection_tester_1.PostgresConnectionTester,
            mysql_connection_tester_1.MysqlConnectionTester,
            {
                provide: "DatabaseConnectionRepository",
                useClass: prisma_database_connection_repository_1.PrismaDatabaseConnectionRepository,
            },
            {
                provide: "UserRepository",
                useClass: prisma_user_repository_1.PrismaUserRepository,
            },
            {
                provide: "DatabaseConnectionTesterFactory",
                useClass: database_connection_tester_factory_1.DatabaseConnectionTesterFactoryImpl,
            },
            {
                provide: "DatabaseMetricCollectorFactory",
                useClass: database_metric_collector_factory_1.DatabaseMetricCollectorFactoryImpl,
            },
            {
                provide: "DatabaseHealthService",
                useClass: database_health_service_1.DatabaseHealthServiceImpl,
            },
        ],
    })
], DatabaseConnectionModule);
//# sourceMappingURL=database-connection.module.js.map