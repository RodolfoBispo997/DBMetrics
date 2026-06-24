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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const get_dashboard_overview_use_case_1 = require("./application/use-cases/get-dashboard-overview/get-dashboard-overview.use-case");
const get_dashboard_connection_metrics_history_use_case_1 = require("./application/use-cases/get-dashboard-connection-metrics-history/get-dashboard-connection-metrics-history.use-case");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_dashboard_connection_metrics_chart_use_case_1 = require("./application/use-cases/get-dashboard-connection-metrics-chart/get-dashboard-connection-metrics-chart.use-case");
const get_dashboard_connection_metrics_summary_use_case_1 = require("./application/use-cases/get-dashboard-connection-metrics-summary/get-dashboard-connection-metrics-summary.use-case");
let DashboardController = class DashboardController {
    constructor(getDashboardOverviewUseCase, getDashboardConnectionMetricsHistoryUseCase, getDashboardConnectionMetricsChartUseCase, getDashboardConnectionMetricsSummaryUseCase) {
        this.getDashboardOverviewUseCase = getDashboardOverviewUseCase;
        this.getDashboardConnectionMetricsHistoryUseCase = getDashboardConnectionMetricsHistoryUseCase;
        this.getDashboardConnectionMetricsChartUseCase = getDashboardConnectionMetricsChartUseCase;
        this.getDashboardConnectionMetricsSummaryUseCase = getDashboardConnectionMetricsSummaryUseCase;
    }
    async overview(request) {
        const userId = request.user.userId;
        return this.getDashboardOverviewUseCase.execute({ userId });
    }
    async connectionMetricsHistory(request, connectionId, startDate, endDate) {
        const userId = request.user.userId;
        return this.getDashboardConnectionMetricsHistoryUseCase.execute({
            userId,
            connectionId,
            startDate,
            endDate,
        });
    }
    async connectionMetricsChart(request, connectionId, startDate, endDate) {
        const userId = request.user.userId;
        return this.getDashboardConnectionMetricsChartUseCase.execute({
            userId,
            connectionId,
            startDate,
            endDate,
        });
    }
    async connectionMetricsSummary(request, connectionId) {
        const userId = request.user.userId;
        return this.getDashboardConnectionMetricsSummaryUseCase.execute({
            userId,
            connectionId,
        });
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("overview"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "overview", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("connections/:connectionId/metrics-history"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("connectionId")),
    __param(2, (0, common_1.Query)("startDate")),
    __param(3, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "connectionMetricsHistory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("connections/:connectionId/metrics-chart"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("connectionId")),
    __param(2, (0, common_1.Query)("startDate")),
    __param(3, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "connectionMetricsChart", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("connections/:connectionId/metrics-summary"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("connectionId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "connectionMetricsSummary", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)("dashboard"),
    __metadata("design:paramtypes", [get_dashboard_overview_use_case_1.GetDashboardOverviewUseCase,
        get_dashboard_connection_metrics_history_use_case_1.GetDashboardConnectionMetricsHistoryUseCase,
        get_dashboard_connection_metrics_chart_use_case_1.GetDashboardConnectionMetricsChartUseCase,
        get_dashboard_connection_metrics_summary_use_case_1.GetDashboardConnectionMetricsSummaryUseCase])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map