"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseMetricModule = void 0;
const common_1 = require("@nestjs/common");
const database_metric_controller_1 = require("./database-metric.controller");
const collect_database_metric_use_case_1 = require("./application/use-cases/collect-database-metric/collect-database-metric.use-case");
const prisma_database_metric_repository_1 = require("./infra/repositories/prisma-database-metric.repository");
const prisma_database_connection_repository_1 = require("../database-connection/infra/repositories/prisma-database-connection.repository");
const database_metric_collector_factory_1 = require("../database-connection/infra/services/database-metric/database-metric-collector-factory");
const mysql_metric_collector_1 = require("../database-connection/infra/services/database-metric/mysql-metric-collector");
const postgres_metric_collector_1 = require("../database-connection/infra/services/database-metric/postgres-metric-collector");
const get_database_metric_use_case_1 = require("./application/use-cases/get-database-metric/get-database-metric.use-case");
let DatabaseMetricModule = class DatabaseMetricModule {
};
exports.DatabaseMetricModule = DatabaseMetricModule;
exports.DatabaseMetricModule = DatabaseMetricModule = __decorate([
    (0, common_1.Module)({
        controllers: [database_metric_controller_1.DatabaseMetricController],
        providers: [
            collect_database_metric_use_case_1.CollectDatabaseMetricUseCase,
            get_database_metric_use_case_1.GetDatabaseMetricUseCase,
            mysql_metric_collector_1.MysqlMetricCollector,
            postgres_metric_collector_1.PostgresMetricCollector,
            {
                provide: "DatabaseMetricRepository",
                useClass: prisma_database_metric_repository_1.PrismaDatabaseMetricRepository,
            },
            {
                provide: "DatabaseConnectionRepository",
                useClass: prisma_database_connection_repository_1.PrismaDatabaseConnectionRepository,
            },
            {
                provide: "DatabaseMetricCollectorFactory",
                useClass: database_metric_collector_factory_1.DatabaseMetricCollectorFactoryImpl,
            },
        ],
    })
], DatabaseMetricModule);
//# sourceMappingURL=database-metric.module.js.map