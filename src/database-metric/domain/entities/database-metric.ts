import { randomUUID } from "node:crypto";
import { CreateDatabaseMetricProps } from "../types/create-database-metric-props.type";
import { DatabaseMetricProps } from "../types/database-metric-props.type";
import { InvalidDatabaseConnectionIdError } from "../errors/invalid-database-connection-id-error";
import { InvalidDatabaseSizeError } from "../errors/invalid-database-size-error";
import { InvalidActiveConnectionsError } from "../errors/invalid-active-connections-error";
import { InvalidDatabaseVersionError } from "../errors/invalid-database-version-error";
import { InvalidTablesCountError } from "../errors/invalid-tables-count-error";

export class DatabaseMetrics {
  private constructor(private readonly props: DatabaseMetricProps) {}

  public static create(props: CreateDatabaseMetricProps): DatabaseMetrics {
    const databaseConnectionId = this.validateDatabaseConnectionId(
      props.databaseConnectionId,
    );

    const databaseVersion = this.validateDatabaseVersion(props.databaseVersion);

    const tablesCount = this.validateTablesCount(props.tablesCount);

    const databaseSize = this.validateDatabaseSize(props.databaseSize);

    const activeConnections = this.validateActiveConnections(
      props.activeConnections,
    );

    return new DatabaseMetrics({
      id: randomUUID(),
      databaseConnectionId: databaseConnectionId,
      databaseVersion: databaseVersion,
      tablesCount: tablesCount,
      databaseSize: databaseSize,
      activeConnections: activeConnections,
      createdAt: new Date(),
    });
  }

  public static restore(props: DatabaseMetricProps): DatabaseMetrics {
    return new DatabaseMetrics(props);
  }

  private static validateDatabaseConnectionId(
    databaseConnectionId: string,
  ): string {
    const normalized = databaseConnectionId.trim();

    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!normalized) {
      throw new InvalidDatabaseConnectionIdError(
        "Database connection id cannot be empty",
      );
    }

    if (!UUID_REGEX.test(normalized)) {
      throw new InvalidDatabaseConnectionIdError(
        "Invalid database connection id",
      );
    }

    return normalized;
  }

  private static validateDatabaseVersion(databaseVersion: string): string {
    const normalized = databaseVersion.trim().replace(/\s+/g, " ");

    if (!normalized) {
      throw new InvalidDatabaseVersionError("Database version cannot be empty");
    }

    return normalized;
  }

  private static validateTablesCount(tablesCount: number): number {
    if (!Number.isInteger(tablesCount)) {
      throw new InvalidTablesCountError("Tables count must be an integer");
    }

    if (tablesCount < 0) {
      throw new InvalidTablesCountError("Tables count cannot be negative");
    }

    return tablesCount;
  }

  private static validateDatabaseSize(databaseSize: number): number {
    if (!Number.isFinite(databaseSize)) {
      throw new InvalidDatabaseSizeError(
        "Database size must be a valid number",
      );
    }

    if (databaseSize < 0) {
      throw new InvalidDatabaseSizeError("Database size cannot be negative");
    }

    return databaseSize;
  }

  private static validateActiveConnections(activeConnections: number): number {
    if (!Number.isInteger(activeConnections)) {
      throw new InvalidActiveConnectionsError(
        "Active connections must be an integer",
      );
    }

    if (activeConnections < 0) {
      throw new InvalidActiveConnectionsError(
        "Active connections cannot be negative",
      );
    }

    return activeConnections;
  }

  get id() {
    return this.props.id;
  }

  get databaseConnectionId() {
    return this.props.databaseConnectionId;
  }

  get databaseVersion() {
    return this.props.databaseVersion;
  }

  get tablesCount() {
    return this.props.tablesCount;
  }

  get databaseSize() {
    return this.props.databaseSize;
  }

  get activeConnections() {
    return this.props.activeConnections;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
