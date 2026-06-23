import { DatabaseProvider } from "../../../database-connection/domain/enums/database-provider.enum";
export type DashboardSummary = {
    totalConnections: number;
    totalDatabaseSize: number;
    totalActiveConnections: number;
};
export type DashboardConnectionOverview = {
    connectionId: string;
    name: string;
    provider: DatabaseProvider;
    database: string;
    lastMetric: {
        databaseVersion: string;
        tablesCount: number;
        databaseSize: number;
        activeConnections: number;
        collectedAt: Date;
    } | null;
};
export type DashboardOverview = {
    summary: DashboardSummary;
    connections: DashboardConnectionOverview[];
};
