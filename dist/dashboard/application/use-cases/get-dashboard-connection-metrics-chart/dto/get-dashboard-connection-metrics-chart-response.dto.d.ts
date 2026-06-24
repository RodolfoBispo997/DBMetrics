export type DashboardMetricChartPointDTO = {
    collectedAt: Date;
    value: number;
};
export type GetDashboardConnectionMetricsChartResponseDTO = {
    connectionId: string;
    charts: {
        databaseSize: DashboardMetricChartPointDTO[];
        activeConnections: DashboardMetricChartPointDTO[];
        tablesCount: DashboardMetricChartPointDTO[];
    };
};
