import { GetDashboardOverviewUseCase } from "./application/use-cases/get-dashboard-overview/get-dashboard-overview.use-case";
import { GetDashboardConnectionMetricsHistoryUseCase } from "./application/use-cases/get-dashboard-connection-metrics-history/get-dashboard-connection-metrics-history.use-case";
import { GetDashboardConnectionMetricsChartUseCase } from "./application/use-cases/get-dashboard-connection-metrics-chart/get-dashboard-connection-metrics-chart.use-case";
export declare class DashboardController {
    private readonly getDashboardOverviewUseCase;
    private readonly getDashboardConnectionMetricsHistoryUseCase;
    private readonly getDashboardConnectionMetricsChartUseCase;
    constructor(getDashboardOverviewUseCase: GetDashboardOverviewUseCase, getDashboardConnectionMetricsHistoryUseCase: GetDashboardConnectionMetricsHistoryUseCase, getDashboardConnectionMetricsChartUseCase: GetDashboardConnectionMetricsChartUseCase);
    overview(request: any): Promise<import("./application/types/dashboard-overview.type").DashboardOverview>;
    connectionMetricsHistory(request: any, connectionId: string, startDate?: string, endDate?: string): Promise<import("./application/use-cases/get-dashboard-connection-metrics-history/dto/get-dashboard-connection-metrics-history-response.dto").GetDashboardConnectionMetricsHistoryResponseDTO>;
    connectionMetricsChart(request: any, connectionId: string, startDate?: string, endDate?: string): Promise<import("./application/use-cases/get-dashboard-connection-metrics-chart/dto/get-dashboard-connection-metrics-chart-response.dto").GetDashboardConnectionMetricsChartResponseDTO>;
}
