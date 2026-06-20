import { CollectDatabaseMetricUseCase } from "./application/use-cases/collect-database-metric/collect-database-metric.use-case";
import { GetDatabaseMetricUseCase } from "./application/use-cases/get-database-metric/get-database-metric.use-case";
export declare class DatabaseMetricController {
    private readonly collectDatabaseMetricUseCase;
    private readonly getDatabaseMetricUseCase;
    constructor(collectDatabaseMetricUseCase: CollectDatabaseMetricUseCase, getDatabaseMetricUseCase: GetDatabaseMetricUseCase);
    collect(request: any, connectionId: string): Promise<{
        message: string;
    }>;
    get(request: any, connectionId: string): Promise<import("./application/use-cases/get-database-metric/dto/get-database-metric-response.dto").GetDatabaseMetricResponseDTO[]>;
}
