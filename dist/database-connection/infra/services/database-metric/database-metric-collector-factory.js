"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseMetricCollectorFactoryImpl = void 0;
const common_1 = require("@nestjs/common");
const database_provider_enum_1 = require("../../../domain/enums/database-provider.enum");
const mysql_metric_collector_1 = require("./mysql-metric-collector");
const postgres_metric_collector_1 = require("./postgres-metric-collector");
let DatabaseMetricCollectorFactoryImpl = class DatabaseMetricCollectorFactoryImpl {
    constructor(postgresMetricCollector, mysqlMetricCollector) {
        this.postgresMetricCollector = postgresMetricCollector;
        this.mysqlMetricCollector = mysqlMetricCollector;
    }
    get(provider) {
        if (provider === database_provider_enum_1.DatabaseProvider.POSTGRESQL) {
            return this.postgresMetricCollector;
        }
        if (provider === database_provider_enum_1.DatabaseProvider.MYSQL) {
            return this.mysqlMetricCollector;
        }
        throw new Error("Unsupported database provider");
    }
};
exports.DatabaseMetricCollectorFactoryImpl = DatabaseMetricCollectorFactoryImpl;
exports.DatabaseMetricCollectorFactoryImpl = DatabaseMetricCollectorFactoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [postgres_metric_collector_1.PostgresMetricCollector,
        mysql_metric_collector_1.MysqlMetricCollector])
], DatabaseMetricCollectorFactoryImpl);
//# sourceMappingURL=database-metric-collector-factory.js.map