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
var DatabaseMetricScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseMetricScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const collect_database_metrics_use_case_1 = require("../../application/use-cases/collect-database-metrics/collect-database-metrics.use-case");
let DatabaseMetricScheduler = DatabaseMetricScheduler_1 = class DatabaseMetricScheduler {
    constructor(collectDatabaseMetricsUseCase) {
        this.collectDatabaseMetricsUseCase = collectDatabaseMetricsUseCase;
        this.logger = new common_1.Logger(DatabaseMetricScheduler_1.name);
    }
    async handleDatabaseMetricsCollection() {
        this.logger.log("Starting metrics collection...");
        const result = await this.collectDatabaseMetricsUseCase.execute();
        this.logger.log(`Metrics collection finished: ${result.success}/${result.processed} successful (${result.failed} failed)`);
    }
};
exports.DatabaseMetricScheduler = DatabaseMetricScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseMetricScheduler.prototype, "handleDatabaseMetricsCollection", null);
exports.DatabaseMetricScheduler = DatabaseMetricScheduler = DatabaseMetricScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [collect_database_metrics_use_case_1.CollectDatabaseMetricsUseCase])
], DatabaseMetricScheduler);
//# sourceMappingURL=database-metric.scheduler.js.map