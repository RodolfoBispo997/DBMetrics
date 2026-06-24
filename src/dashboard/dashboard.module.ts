import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { GetDashboardOverviewUseCase } from "./application/use-cases/get-dashboard-overview/get-dashboard-overview.use-case";
import { PrismaDatabaseConnectionRepository } from "../database-connection/infra/repositories/prisma-database-connection.repository";
import { PrismaDatabaseMetricRepository } from "../database-metric/infra/repositories/prisma-database-metric.repository";
import { GetDashboardConnectionMetricsHistoryUseCase } from "./application/use-cases/get-dashboard-connection-metrics-history/get-dashboard-connection-metrics-history.use-case";
import { GetDashboardConnectionMetricsChartUseCase } from "./application/use-cases/get-dashboard-connection-metrics-chart/get-dashboard-connection-metrics-chart.use-case";
import { GetDashboardConnectionMetricsSummaryUseCase } from "./application/use-cases/get-dashboard-connection-metrics-summary/get-dashboard-connection-metrics-summary.use-case";

@Module({
  controllers: [DashboardController],
  providers: [
    GetDashboardOverviewUseCase,
    GetDashboardConnectionMetricsHistoryUseCase,
    GetDashboardConnectionMetricsChartUseCase,
    GetDashboardConnectionMetricsSummaryUseCase,

    {
      provide: "DatabaseConnectionRepository",
      useClass: PrismaDatabaseConnectionRepository,
    },
    {
      provide: "DatabaseMetricRepository",
      useClass: PrismaDatabaseMetricRepository,
    },
  ],
})
export class DashboardModule {}
