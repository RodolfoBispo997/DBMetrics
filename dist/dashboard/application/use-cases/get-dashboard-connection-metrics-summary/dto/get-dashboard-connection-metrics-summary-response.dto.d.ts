export type DashboardConnectionCurrentMetricDTO = {
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
export type DashboardConnectionGrowthDTO = {
    databaseSize: number;
    tablesCount: number;
    viewsCount: number;
    schemasCount: number;
    indexesCount: number;
    functionsCount: number;
    activeConnections: number;
};
export type GetDashboardConnectionMetricsSummaryResponseDTO = {
    connectionId: string;
    current: DashboardConnectionCurrentMetricDTO | null;
    growth: DashboardConnectionGrowthDTO | null;
};
