export type DashboardConnectionMetricHistoryItem = {
  id: string;
  databaseVersion: string;
  tablesCount: number;
  viewsCount: number;
  schemasCount: number;
  indexesCount: number;
  functionsCount: number;
  databaseSize: number;
  activeConnections: number;

  collectedAt: Date;
};

export type GetDashboardConnectionMetricsHistoryResponseDTO = {
  connectionId: string;
  history: DashboardConnectionMetricHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
