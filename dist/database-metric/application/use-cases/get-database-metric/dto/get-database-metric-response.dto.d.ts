export type GetDatabaseMetricResponseDTO = {
    id: string;
    databaseVersion: string;
    tablesCount: number;
    databaseSize: number;
    activeConnections: number;
    viewsCount: number;
    schemasCount: number;
    indexesCount: number;
    functionsCount: number;
    createdAt: Date;
};
