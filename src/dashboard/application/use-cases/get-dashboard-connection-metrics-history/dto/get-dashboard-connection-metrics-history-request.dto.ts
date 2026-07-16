export type GetDashboardConnectionMetricsHistoryRequestDTO = {
  userId: string;
  connectionId: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
};
