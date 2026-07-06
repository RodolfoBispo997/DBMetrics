import { randomUUID } from "node:crypto";
import { DomainError } from "../../../user/domain/errors/domain-error";
import { InvalidActiveConnectionsError } from "../errors/invalid-active-connections-error";
import { InvalidDatabaseConnectionIdError } from "../errors/invalid-database-connection-id-error";
import { InvalidDatabaseSizeError } from "../errors/invalid-database-size-error";
import { InvalidDatabaseVersionError } from "../errors/invalid-database-version-error";
import { InvalidFunctionsCountError } from "../errors/invalid-functions-count-error";
import { InvalidIndexesCountError } from "../errors/invalid-indexes-count-error";
import { InvalidSchemasCountError } from "../errors/invalid-schemas-count-error";
import { InvalidTablesCountError } from "../errors/invalid-tables-count-error";
import { InvalidViewsCountError } from "../errors/invalid-views-count-error";
import { CreateDatabaseMetricProps } from "../types/create-database-metric-props.type";
import { DatabaseMetricProps } from "../types/database-metric-props.type";

export class DatabaseMetrics {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private constructor(private readonly props: DatabaseMetricProps) {}

  public static create(props: CreateDatabaseMetricProps): DatabaseMetrics {
    return new DatabaseMetrics({
      id: randomUUID(),
      databaseConnectionId: this.validateDatabaseConnectionId(
        props.databaseConnectionId,
      ),
      databaseVersion: this.validateDatabaseVersion(props.databaseVersion),
      tablesCount: this.validateTablesCount(props.tablesCount),
      viewsCount: this.validateViewsCount(props.viewsCount),
      schemasCount: this.validateSchemasCount(props.schemasCount),
      indexesCount: this.validateIndexesCount(props.indexesCount),
      functionsCount: this.validateFunctionsCount(props.functionsCount),
      databaseSize: this.validateDatabaseSize(props.databaseSize),
      activeConnections: this.validateActiveConnections(
        props.activeConnections,
      ),
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

    if (!normalized) {
      throw new InvalidDatabaseConnectionIdError(
        "Database connection id cannot be empty",
      );
    }

    if (!this.UUID_REGEX.test(normalized)) {
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

  private static validateTablesCount(value: number): number {
    return this.validateMetricCount(
      value,
      InvalidTablesCountError,
      "Tables count",
    );
  }

  private static validateViewsCount(value: number): number {
    return this.validateMetricCount(
      value,
      InvalidViewsCountError,
      "Views count",
    );
  }

  private static validateSchemasCount(value: number): number {
    return this.validateMetricCount(
      value,
      InvalidSchemasCountError,
      "Schemas count",
    );
  }

  private static validateIndexesCount(value: number): number {
    return this.validateMetricCount(
      value,
      InvalidIndexesCountError,
      "Indexes count",
    );
  }

  private static validateFunctionsCount(value: number): number {
    return this.validateMetricCount(
      value,
      InvalidFunctionsCountError,
      "Functions count",
    );
  }

  private static validateActiveConnections(value: number): number {
    return this.validateMetricCount(
      value,
      InvalidActiveConnectionsError,
      "Active connections",
    );
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

  private static validateMetricCount<T extends DomainError>(
    value: number,
    ErrorType: new (reason: string) => T,
    field: string,
  ): number {
    if (!Number.isInteger(value)) {
      throw new ErrorType(`${field} must be an integer`);
    }

    if (value < 0) {
      throw new ErrorType(`${field} cannot be negative`);
    }

    return value;
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

  get viewsCount() {
    return this.props.viewsCount;
  }

  get schemasCount() {
    return this.props.schemasCount;
  }

  get indexesCount() {
    return this.props.indexesCount;
  }

  get functionsCount() {
    return this.props.functionsCount;
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
