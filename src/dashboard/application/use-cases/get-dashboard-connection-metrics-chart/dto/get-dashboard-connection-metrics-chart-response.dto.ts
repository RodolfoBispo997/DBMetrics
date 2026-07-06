export type DashboardMetricChartPointDTO = {
  collectedAt: Date;
  value: number;
};

export type GetDashboardConnectionMetricsChartResponseDTO = {
  connectionId: string;

  series: {
    databaseSize: DashboardMetricChartPointDTO[];
    activeConnections: DashboardMetricChartPointDTO[];
    tablesCount: DashboardMetricChartPointDTO[];
    viewsCount: DashboardMetricChartPointDTO[];
    schemasCount: DashboardMetricChartPointDTO[];
    indexesCount: DashboardMetricChartPointDTO[];
    functionsCount: DashboardMetricChartPointDTO[];
  };
};
