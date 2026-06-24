import { GetDashboardOverviewUseCase } from "./application/use-cases/get-dashboard-overview/get-dashboard-overview.use-case";
import { GetDashboardConnectionMetricsHistoryUseCase } from "./application/use-cases/get-dashboard-connection-metrics-history/get-dashboard-connection-metrics-history.use-case";
import { GetDashboardConnectionMetricsChartUseCase } from "./application/use-cases/get-dashboard-connection-metrics-chart/get-dashboard-connection-metrics-chart.use-case";
import { GetDashboardConnectionMetricsSummaryUseCase } from "./application/use-cases/get-dashboard-connection-metrics-summary/get-dashboard-connection-metrics-summary.use-case";
export declare class DashboardController {
    private readonly getDashboardOverviewUseCase;
    private readonly getDashboardConnectionMetricsHistoryUseCase;
    private readonly getDashboardConnectionMetricsChartUseCase;
    private readonly getDashboardConnectionMetricsSummaryUseCase;
    constructor(getDashboardOverviewUseCase: GetDashboardOverviewUseCase, getDashboardConnectionMetricsHistoryUseCase: GetDashboardConnectionMetricsHistoryUseCase, getDashboardConnectionMetricsChartUseCase: GetDashboardConnectionMetricsChartUseCase, getDashboardConnectionMetricsSummaryUseCase: GetDashboardConnectionMetricsSummaryUseCase);
    overview(request: any): Promise<import("./application/types/dashboard-overview.type").DashboardOverview>;
    connectionMetricsHistory(request: any, connectionId: string, startDate?: string, endDate?: string): Promise<import("./application/use-cases/get-dashboard-connection-metrics-history/dto/get-dashboard-connection-metrics-history-response.dto").GetDashboardConnectionMetricsHistoryResponseDTO>;
    connectionMetricsChart(request: any, connectionId: string, startDate?: string, endDate?: string): Promise<import("./application/use-cases/get-dashboard-connection-metrics-chart/dto/get-dashboard-connection-metrics-chart-response.dto").GetDashboardConnectionMetricsChartResponseDTO>;
    connectionMetricsSummary(request: any, connectionId: string): Promise<import("./application/use-cases/get-dashboard-connection-metrics-summary/dto/get-dashboard-connection-metrics-summary-response.dto").GetDashboardConnectionMetricsSummaryResponseDTO>;
}
