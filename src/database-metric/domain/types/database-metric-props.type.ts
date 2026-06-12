export type DatabaseMetricProps = {
  id: string;
  databaseConnectionId: string;
  databaseVersion: string;
  tablesCount: number;
  databaseSize: number;
  activeConnections: number;
  createdAt: Date;
};
