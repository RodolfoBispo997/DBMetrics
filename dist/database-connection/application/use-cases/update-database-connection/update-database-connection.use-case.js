"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDatabaseConnectionUseCase = void 0;
const database_connection_not_found_error_1 = require("../../../domain/errors/database-connection-not-found-error");
class UpdateDatabaseConnectionUseCase {
    constructor(databaseConnectionRepository) {
        this.databaseConnectionRepository = databaseConnectionRepository;
    }
    async execute(data) {
        const databaseConnection = await this.databaseConnectionRepository.findById(data.id);
        if (!databaseConnection) {
            throw new database_connection_not_found_error_1.DatabaseConnectionNotFoundError("Database connection not found");
        }
        if (databaseConnection.userId !== data.userId) {
            throw new database_connection_not_found_error_1.DatabaseConnectionNotFoundError("Database connection not found");
        }
        databaseConnection.update({
            name: data.name,
            provider: data.provider,
            host: data.host,
            port: data.port,
            database: data.database,
            username: data.username,
            password: data.password,
        });
        await this.databaseConnectionRepository.update(databaseConnection);
        return {
            name: databaseConnection.name,
            provider: databaseConnection.provider,
            host: databaseConnection.host,
            port: databaseConnection.port,
            database: databaseConnection.database,
            username: databaseConnection.username,
        };
    }
}
exports.UpdateDatabaseConnectionUseCase = UpdateDatabaseConnectionUseCase;
//# sourceMappingURL=update-database-connection.use-case.js.map