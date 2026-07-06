"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseMetrics = void 0;
const node_crypto_1 = require("node:crypto");
const invalid_active_connections_error_1 = require("../errors/invalid-active-connections-error");
const invalid_database_connection_id_error_1 = require("../errors/invalid-database-connection-id-error");
const invalid_database_size_error_1 = require("../errors/invalid-database-size-error");
const invalid_database_version_error_1 = require("../errors/invalid-database-version-error");
const invalid_functions_count_error_1 = require("../errors/invalid-functions-count-error");
const invalid_indexes_count_error_1 = require("../errors/invalid-indexes-count-error");
const invalid_schemas_count_error_1 = require("../errors/invalid-schemas-count-error");
const invalid_tables_count_error_1 = require("../errors/invalid-tables-count-error");
const invalid_views_count_error_1 = require("../errors/invalid-views-count-error");
class DatabaseMetrics {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new DatabaseMetrics({
            id: (0, node_crypto_1.randomUUID)(),
            databaseConnectionId: this.validateDatabaseConnectionId(props.databaseConnectionId),
            databaseVersion: this.validateDatabaseVersion(props.databaseVersion),
            tablesCount: this.validateTablesCount(props.tablesCount),
            viewsCount: this.validateViewsCount(props.viewsCount),
            schemasCount: this.validateSchemasCount(props.schemasCount),
            indexesCount: this.validateIndexesCount(props.indexesCount),
            functionsCount: this.validateFunctionsCount(props.functionsCount),
            databaseSize: this.validateDatabaseSize(props.databaseSize),
            activeConnections: this.validateActiveConnections(props.activeConnections),
            createdAt: new Date(),
        });
    }
    static restore(props) {
        return new DatabaseMetrics(props);
    }
    static validateDatabaseConnectionId(databaseConnectionId) {
        const normalized = databaseConnectionId.trim();
        if (!normalized) {
            throw new invalid_database_connection_id_error_1.InvalidDatabaseConnectionIdError("Database connection id cannot be empty");
        }
        if (!this.UUID_REGEX.test(normalized)) {
            throw new invalid_database_connection_id_error_1.InvalidDatabaseConnectionIdError("Invalid database connection id");
        }
        return normalized;
    }
    static validateDatabaseVersion(databaseVersion) {
        const normalized = databaseVersion.trim().replace(/\s+/g, " ");
        if (!normalized) {
            throw new invalid_database_version_error_1.InvalidDatabaseVersionError("Database version cannot be empty");
        }
        return normalized;
    }
    static validateTablesCount(value) {
        return this.validateMetricCount(value, invalid_tables_count_error_1.InvalidTablesCountError, "Tables count");
    }
    static validateViewsCount(value) {
        return this.validateMetricCount(value, invalid_views_count_error_1.InvalidViewsCountError, "Views count");
    }
    static validateSchemasCount(value) {
        return this.validateMetricCount(value, invalid_schemas_count_error_1.InvalidSchemasCountError, "Schemas count");
    }
    static validateIndexesCount(value) {
        return this.validateMetricCount(value, invalid_indexes_count_error_1.InvalidIndexesCountError, "Indexes count");
    }
    static validateFunctionsCount(value) {
        return this.validateMetricCount(value, invalid_functions_count_error_1.InvalidFunctionsCountError, "Functions count");
    }
    static validateActiveConnections(value) {
        return this.validateMetricCount(value, invalid_active_connections_error_1.InvalidActiveConnectionsError, "Active connections");
    }
    static validateDatabaseSize(databaseSize) {
        if (!Number.isFinite(databaseSize)) {
            throw new invalid_database_size_error_1.InvalidDatabaseSizeError("Database size must be a valid number");
        }
        if (databaseSize < 0) {
            throw new invalid_database_size_error_1.InvalidDatabaseSizeError("Database size cannot be negative");
        }
        return databaseSize;
    }
    static validateMetricCount(value, ErrorType, field) {
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
exports.DatabaseMetrics = DatabaseMetrics;
DatabaseMetrics.UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
//# sourceMappingURL=database-metric.js.map