export type DashboardConnectionMetricSummaryDTO = {
  id: string;
  databaseVersion: string;
  tablesCount: number;
  databaseSize: number;
  activeConnections: number;
  collectedAt: Date;
};

export type GetDashboardConnectionMetricsSummaryResponseDTO = {
  connectionId: string;
  metric: DashboardConnectionMetricSummaryDTO | null;
};
