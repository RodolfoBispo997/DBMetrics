export type DashboardConnectionMetricHistoryItem = {
  id: string;
  databaseVersion: string;
  tablesCount: number;
  databaseSize: number;
  activeConnections: number;
  collectedAt: Date;
};

export type GetDashboardConnectionMetricsHistoryResponseDTO = {
  connectionId: string;
  metrics: DashboardConnectionMetricHistoryItem[];
};
