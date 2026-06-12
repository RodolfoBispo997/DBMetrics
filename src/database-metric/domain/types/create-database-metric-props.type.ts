export type CreateDatabaseMetricProps = {
  databaseConnectionId: string;
  databaseVersion: string;
  tablesCount: number;
  databaseSize: number;
  activeConnections: number;
};
