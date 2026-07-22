import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { GetDashboardOverviewUseCase } from "./application/use-cases/get-dashboard-overview/get-dashboard-overview.use-case";
import { GetDashboardConnectionMetricsHistoryUseCase } from "./application/use-cases/get-dashboard-connection-metrics-history/get-dashboard-connection-metrics-history.use-case";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetDashboardConnectionMetricsChartUseCase } from "./application/use-cases/get-dashboard-connection-metrics-chart/get-dashboard-connection-metrics-chart.use-case";
import { GetDashboardConnectionMetricsSummaryUseCase } from "./application/use-cases/get-dashboard-connection-metrics-summary/get-dashboard-connection-metrics-summary.use-case";
import { GetDashboardOverviewResponseDTO } from "./application/use-cases/get-dashboard-overview/dto/get-dashboard-overview-response.dto";
import { GetDashboardConnectionMetricsHistoryResponseDTO } from "./application/use-cases/get-dashboard-connection-metrics-history/dto/get-dashboard-connection-metrics-history-response.dto";
import { GetDashboardConnectionMetricsChartResponseDTO } from "./application/use-cases/get-dashboard-connection-metrics-chart/dto/get-dashboard-connection-metrics-chart-response.dto";
import { GetDashboardConnectionMetricsSummaryResponseDTO } from "./application/use-cases/get-dashboard-connection-metrics-summary/dto/get-dashboard-connection-metrics-summary-response.dto";
import { DashboardMetricsHistoryQueryHttpDTO } from "./presentation/dto/dashboard-metrics-history-query-http.dto";
import { DashboardMetricsChartQueryHttpDTO } from "./presentation/dto/dashboard-metrics-chart-query-http.dto";

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
  async overview(@Req() request: any): Promise<GetDashboardOverviewResponseDTO> {
    const userId = request.user.userId;

    return this.getDashboardOverviewUseCase.execute({ userId });
  }

  @UseGuards(JwtAuthGuard)
  @Get("connections/:connectionId/metrics-history")
  async connectionMetricsHistory(
    @Req() request: any,
    @Param("connectionId") connectionId: string,
    @Query() query: DashboardMetricsHistoryQueryHttpDTO,
  ): Promise<GetDashboardConnectionMetricsHistoryResponseDTO> {
    const userId = request.user.userId;

    return this.getDashboardConnectionMetricsHistoryUseCase.execute({
      userId,
      connectionId,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page,
      limit: query.limit,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get("connections/:connectionId/metrics-chart")
  async connectionMetricsChart(
    @Req() request: any,
    @Param("connectionId") connectionId: string,
    @Query() query: DashboardMetricsChartQueryHttpDTO,
  ): Promise<GetDashboardConnectionMetricsChartResponseDTO> {
    const userId = request.user.userId;

    return this.getDashboardConnectionMetricsChartUseCase.execute({
      userId,
      connectionId,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get("connections/:connectionId/metrics-summary")
  async connectionMetricsSummary(
    @Req() request: any,
    @Param("connectionId") connectionId: string,
  ): Promise<GetDashboardConnectionMetricsSummaryResponseDTO> {
    const userId = request.user.userId;

    return this.getDashboardConnectionMetricsSummaryUseCase.execute({
      userId,
      connectionId,
    });
  }
}
