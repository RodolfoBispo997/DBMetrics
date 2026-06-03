"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnection = void 0;
const node_crypto_1 = require("node:crypto");
const invalid_connection_name_error_1 = require("../errors/invalid-connection-name-error");
const invalid_database_name_error_1 = require("../errors/invalid-database-name-error");
const invalid_host_error_1 = require("../errors/invalid-host-error");
const invalid_password_error_1 = require("../errors/invalid-password-error");
const invalid_port_error_1 = require("../errors/invalid-port-error");
const invalid_username_error_1 = require("../errors/invalid-username-error");
const invalid_user_id_error_1 = require("../errors/invalid-user-id-error");
const database_provider_enum_1 = require("../enums/database-provider.enum");
const invalid_provider_database_error_1 = require("../errors/invalid-provider-database-error");
class DatabaseConnection {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        const name = this.validateName(props.name);
        const host = this.validateHost(props.host);
        const port = this.validatePort(props.port);
        const database = this.validateDatabase(props.database);
        const username = this.validateUsername(props.username);
        const password = this.validatePassword(props.password);
        const provider = this.validateDatabaseProvider(props.provider);
        const userId = this.validateUserId(props.userId);
        return new DatabaseConnection({
            id: (0, node_crypto_1.randomUUID)(),
            name: name,
            provider: provider,
            host: host,
            port: port,
            database: database,
            username: username,
            password: password,
            userId: userId,
        });
    }
    static validateName(name) {
        const normalized = name.trim().replace(/\s+/g, " ");
        if (!normalized) {
            throw new invalid_connection_name_error_1.InvalidConnectionNameError("Name cannot be empty");
        }
        return normalized;
    }
    static validateHost(host) {
        const normalized = host.trim().replace(/\s+/g, " ");
        if (!normalized) {
            throw new invalid_host_error_1.InvalidHostError("Host cannot not be empty");
        }
        return normalized;
    }
    static validatePort(port) {
        if (!Number.isInteger(port)) {
            throw new invalid_port_error_1.InvalidPortError("Port must be an integer");
        }
        if (port <= 0) {
            throw new invalid_port_error_1.InvalidPortError("Port must be greater than zero");
        }
        if (port > 65535) {
            throw new invalid_port_error_1.InvalidPortError("Port must be less than or equal to 65535");
        }
        return port;
    }
    static validateDatabase(dataBase) {
        const normalized = dataBase.trim().replace(/\s+/g, " ");
        if (!normalized) {
            throw new invalid_database_name_error_1.InvalidDatabaseNameError("Database cannot not be empty");
        }
        return normalized;
    }
    static validateUsername(username) {
        const normalized = username.trim().replace(/\s+/g, " ");
        if (!normalized) {
            throw new invalid_username_error_1.InvalidUsernameError("User Name cannot not be empty");
        }
        return normalized;
    }
    static validatePassword(password) {
        const normalized = password.trim().replace(/\s+/g, " ");
        if (!normalized) {
            throw new invalid_password_error_1.InvalidPasswordError("Password cannot not be empty");
        }
        return normalized;
    }
    static validateUserId(userId) {
        const normalized = userId.trim().replace(/\s+/g, " ");
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!normalized) {
            throw new invalid_user_id_error_1.InvalidUserIdError("UserId cannot not be empty");
        }
        if (!UUID_REGEX.test(normalized)) {
            throw new invalid_user_id_error_1.InvalidUserIdError("Invalid user id");
        }
        return normalized;
    }
    static validateDatabaseProvider(value) {
        if (!Object.values(database_provider_enum_1.DatabaseProvider).includes(value)) {
            throw new invalid_provider_database_error_1.InvalidProviderDatabaseError("Invalid database provider");
        }
        return value;
    }
    get id() {
        return this.props.id;
    }
    get name() {
        return this.props.name;
    }
    get provider() {
        return this.props.provider;
    }
    get host() {
        return this.props.host;
    }
    get port() {
        return this.props.port;
    }
    get database() {
        return this.props.database;
    }
    get username() {
        return this.props.username;
    }
    get password() {
        return this.props.password;
    }
    get userId() {
        return this.props.userId;
    }
}
exports.DatabaseConnection = DatabaseConnection;
//# sourceMappingURL=database-connection.js.map