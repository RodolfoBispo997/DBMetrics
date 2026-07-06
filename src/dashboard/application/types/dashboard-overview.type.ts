import { DatabaseProvider } from "../../../database-connection/domain/enums/database-provider.enum";

export type DashboardSummary = {
  totalConnections: number;
  totalDatabaseSize: number;
  totalActiveConnections: number;

  totalTables: number;
  totalViews: number;
  totalSchemas: number;
  totalIndexes: number;
  totalFunctions: number;
};

export type DashboardConnectionOverview = {
  connectionId: string;
  name: string;
  provider: DatabaseProvider;
  database: string;

  lastMetric: {
    databaseVersion: string;

    tablesCount: number;
    viewsCount: number;
    schemasCount: number;
    indexesCount: number;
    functionsCount: number;

    databaseSize: number;
    activeConnections: number;

    collectedAt: Date;
  } | null;
};

export type DashboardOverview = {
  summary: DashboardSummary;
  connections: DashboardConnectionOverview[];
};
