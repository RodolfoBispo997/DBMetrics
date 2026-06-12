import { CreateDatabaseMetricProps } from "../types/create-database-metric-props.type";
import { DatabaseMetricProps } from "../types/database-metric-props.type";
export declare class DatabaseMetrics {
    private readonly props;
    private constructor();
    static create(props: CreateDatabaseMetricProps): DatabaseMetrics;
    static restore(props: DatabaseMetricProps): DatabaseMetrics;
    private static validateDatabaseConnectionId;
    private static validateDatabaseVersion;
    private static validateTablesCount;
    private static validateDatabaseSize;
    private static validateActiveConnections;
    get id(): string;
    get databaseConnectionId(): string;
    get databaseVersion(): string;
    get tablesCount(): number;
    get databaseSize(): number;
    get activeConnections(): number;
    get createdAt(): Date;
}
