"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseMetrics = void 0;
const node_crypto_1 = require("node:crypto");
const invalid_database_connection_id_error_1 = require("../errors/invalid-database-connection-id-error");
const invalid_database_size_error_1 = require("../errors/invalid-database-size-error");
const invalid_active_connections_error_1 = require("../errors/invalid-active-connections-error");
const invalid_database_version_error_1 = require("../errors/invalid-database-version-error");
const invalid_tables_count_error_1 = require("../errors/invalid-tables-count-error");
class DatabaseMetrics {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        const databaseConnectionId = this.validateDatabaseConnectionId(props.databaseConnectionId);
        const databaseVersion = this.validateDatabaseVersion(props.databaseVersion);
        const tablesCount = this.validateTablesCount(props.tablesCount);
        const databaseSize = this.validateDatabaseSize(props.databaseSize);
        const activeConnections = this.validateActiveConnections(props.activeConnections);
        return new DatabaseMetrics({
            id: (0, node_crypto_1.randomUUID)(),
            databaseConnectionId: databaseConnectionId,
            databaseVersion: databaseVersion,
            tablesCount: tablesCount,
            databaseSize: databaseSize,
            activeConnections: activeConnections,
            createdAt: new Date(),
        });
    }
    static restore(props) {
        return new DatabaseMetrics(props);
    }
    static validateDatabaseConnectionId(databaseConnectionId) {
        const normalized = databaseConnectionId.trim();
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!normalized) {
            throw new invalid_database_connection_id_error_1.InvalidDatabaseConnectionIdError("Database connection id cannot be empty");
        }
        if (!UUID_REGEX.test(normalized)) {
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
    static validateTablesCount(tablesCount) {
        if (!Number.isInteger(tablesCount)) {
            throw new invalid_tables_count_error_1.InvalidTablesCountError("Tables count must be an integer");
        }
        if (tablesCount < 0) {
            throw new invalid_tables_count_error_1.InvalidTablesCountError("Tables count cannot be negative");
        }
        return tablesCount;
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
    static validateActiveConnections(activeConnections) {
        if (!Number.isInteger(activeConnections)) {
            throw new invalid_active_connections_error_1.InvalidActiveConnectionsError("Active connections must be an integer");
        }
        if (activeConnections < 0) {
            throw new invalid_active_connections_error_1.InvalidActiveConnectionsError("Active connections cannot be negative");
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
exports.DatabaseMetrics = DatabaseMetrics;
//# sourceMappingURL=database-metric.js.map