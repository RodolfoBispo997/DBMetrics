import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { GetDashboardOverviewUseCase } from "./application/use-cases/get-dashboard-overview/get-dashboard-overview.use-case";
import { GetDashboardConnectionMetricsHistoryUseCase } from "./application/use-cases/get-dashboard-connection-metrics-history/get-dashboard-connection-metrics-history.use-case";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetDashboardConnectionMetricsChartUseCase } from "./application/use-cases/get-dashboard-connection-metrics-chart/get-dashboard-connection-metrics-chart.use-case";
import { GetDashboardConnectionMetricsSummaryUseCase } from "./application/use-cases/get-dashboard-connection-metrics-summary/get-dashboard-connection-metrics-summary.use-case";

@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly getDashboardOverviewUseCase: GetDashboardOverviewUseCase,
    private readonly getDashboardConnectionMetricsHistoryUseCase: GetDashboardConnectionMetricsHistoryUseCase,
    private readonly getDashboardConnectionMetricsChartUseCase: GetDashboardConnectionMetricsChartUseCase,
    private readonly getDashboardConnectionMetricsSummaryUseCase: GetDashboardConnectionMetricsSummaryUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get("overview")
  async overview(@Req() request: any) {
    const userId = request.user.userId;

    return this.getDashboardOverviewUseCase.execute({ userId });
  }

  @UseGuards(JwtAuthGuard)
  @Get("connections/:connectionId/metrics-history")
  async connectionMetricsHistory(
    @Req() request: any,
    @Param("connectionId") connectionId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: string,
  ) {
    const userId = request.user.userId;

    return this.getDashboardConnectionMetricsHistoryUseCase.execute({
      userId,
      connectionId,
      startDate,
      endDate,
      limit,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get("connections/:connectionId/metrics-chart")
  async connectionMetricsChart(
    @Req() request: any,
    @Param("connectionId") connectionId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const userId = request.user.userId;

    return this.getDashboardConnectionMetricsChartUseCase.execute({
      userId,
      connectionId,
      startDate,
      endDate,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get("connections/:connectionId/metrics-summary")
  async connectionMetricsSummary(
    @Req() request: any,
    @Param("connectionId") connectionId: string,
  ) {
    const userId = request.user.userId;

    return this.getDashboardConnectionMetricsSummaryUseCase.execute({
      userId,
      connectionId,
    });
  }
}
