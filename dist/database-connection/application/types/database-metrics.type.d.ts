export type DatabaseMetric = {
    databaseVersion: string;
    tablesCount: number;
    viewsCount: number;
    schemasCount: number;
    indexesCount: number;
    functionsCount: number;
    databaseSize: number;
    activeConnections: number;
};
