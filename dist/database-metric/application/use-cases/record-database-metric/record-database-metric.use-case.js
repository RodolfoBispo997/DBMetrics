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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordDatabaseMetricUseCase = void 0;
const common_1 = require("@nestjs/common");
const database_metric_1 = require("../../../domain/entities/database-metric");
let RecordDatabaseMetricUseCase = class RecordDatabaseMetricUseCase {
    constructor(databaseMetricRepository, databaseMetricCollectorFactory) {
        this.databaseMetricRepository = databaseMetricRepository;
        this.databaseMetricCollectorFactory = databaseMetricCollectorFactory;
    }
    async execute(connection) {
        const collector = this.databaseMetricCollectorFactory.get(connection.provider);
        const result = await collector.collect(connection);
        const databaseMetric = database_metric_1.DatabaseMetrics.create({
            databaseConnectionId: connection.id,
            databaseVersion: result.databaseVersion,
            tablesCount: result.tablesCount,
            viewsCount: result.viewsCount,
            schemasCount: result.schemasCount,
            indexesCount: result.indexesCount,
            functionsCount: result.functionsCount,
            databaseSize: result.databaseSize,
            activeConnections: result.activeConnections,
        });
        await this.databaseMetricRepository.save(databaseMetric);
        return databaseMetric;
    }
};
exports.RecordDatabaseMetricUseCase = RecordDatabaseMetricUseCase;
exports.RecordDatabaseMetricUseCase = RecordDatabaseMetricUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("DatabaseMetricRepository")),
    __param(1, (0, common_1.Inject)("DatabaseMetricCollectorFactory")),
    __metadata("design:paramtypes", [Object, Object])
], RecordDatabaseMetricUseCase);
//# sourceMappingURL=record-database-metric.use-case.js.map