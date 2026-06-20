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
exports.DatabaseMetricController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const collect_database_metric_use_case_1 = require("./application/use-cases/collect-database-metric/collect-database-metric.use-case");
const get_database_metric_use_case_1 = require("./application/use-cases/get-database-metric/get-database-metric.use-case");
let DatabaseMetricController = class DatabaseMetricController {
    constructor(collectDatabaseMetricUseCase, getDatabaseMetricUseCase) {
        this.collectDatabaseMetricUseCase = collectDatabaseMetricUseCase;
        this.getDatabaseMetricUseCase = getDatabaseMetricUseCase;
    }
    async collect(request, connectionId) {
        const userId = request.user.userId;
        await this.collectDatabaseMetricUseCase.execute({
            connectionId,
            userId,
        });
        return {
            message: "Metric collected successfully",
        };
    }
    async get(request, connectionId) {
        const userId = request.user.userId;
        return this.getDatabaseMetricUseCase.execute({
            connectionId,
            userId,
        });
    }
};
exports.DatabaseMetricController = DatabaseMetricController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(":id/collect"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DatabaseMetricController.prototype, "collect", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(":id/history"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DatabaseMetricController.prototype, "get", null);
exports.DatabaseMetricController = DatabaseMetricController = __decorate([
    (0, common_1.Controller)("database-metrics"),
    __metadata("design:paramtypes", [collect_database_metric_use_case_1.CollectDatabaseMetricUseCase,
        get_database_metric_use_case_1.GetDatabaseMetricUseCase])
], DatabaseMetricController);
//# sourceMappingURL=database-metric.controller.js.map