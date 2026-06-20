export type GetDatabaseMetricResponseDTO = {
  id: string;
  databaseVersion: string;
  tablesCount: number;
  databaseSize: number;
  activeConnections: number;
};
