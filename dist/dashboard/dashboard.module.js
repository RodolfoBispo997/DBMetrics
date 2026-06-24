"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const dashboard_controller_1 = require("./dashboard.controller");
const get_dashboard_overview_use_case_1 = require("./application/use-cases/get-dashboard-overview/get-dashboard-overview.use-case");
const prisma_database_connection_repository_1 = require("../database-connection/infra/repositories/prisma-database-connection.repository");
const prisma_database_metric_repository_1 = require("../database-metric/infra/repositories/prisma-database-metric.repository");
const get_dashboard_connection_metrics_history_use_case_1 = require("./application/use-cases/get-dashboard-connection-metrics-history/get-dashboard-connection-metrics-history.use-case");
const get_dashboard_connection_metrics_chart_use_case_1 = require("./application/use-cases/get-dashboard-connection-metrics-chart/get-dashboard-connection-metrics-chart.use-case");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        controllers: [dashboard_controller_1.DashboardController],
        providers: [
            get_dashboard_overview_use_case_1.GetDashboardOverviewUseCase,
            get_dashboard_connection_metrics_history_use_case_1.GetDashboardConnectionMetricsHistoryUseCase,
            get_dashboard_connection_metrics_chart_use_case_1.GetDashboardConnectionMetricsChartUseCase,
            {
                provide: "DatabaseConnectionRepository",
                useClass: prisma_database_connection_repository_1.PrismaDatabaseConnectionRepository,
            },
            {
                provide: "DatabaseMetricRepository",
                useClass: prisma_database_metric_repository_1.PrismaDatabaseMetricRepository,
            },
        ],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map