"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaDatabaseConnectionRepository = void 0;
const prisma_client_1 = require("../../../user/infra/database/prisma/prisma-client");
const database_connection_1 = require("../../domain/entities/database-connection");
class PrismaDatabaseConnectionRepository {
    async save(connection) {
        await prisma_client_1.prisma.databaseConnection.create({
            data: {
                id: connection.id,
                name: connection.name,
                provider: connection.provider,
                host: connection.host,
                port: connection.port,
                database: connection.database,
                username: connection.username,
                password: connection.password,
                userId: connection.userId,
            },
        });
    }
    async findManyByUserId(userId) {
        const databaseConnections = await prisma_client_1.prisma.databaseConnection.findMany({
            where: {
                userId,
            },
        });
        return databaseConnections.map((connection) => database_connection_1.DatabaseConnection.restore({
            id: connection.id,
            name: connection.name,
            provider: connection.provider,
            host: connection.host,
            port: connection.port,
            database: connection.database,
            username: connection.username,
            password: connection.password,
            userId: connection.userId,
        }));
    }
    async findById(id) {
        const databaseConnection = await prisma_client_1.prisma.databaseConnection.findUnique({
            where: {
                id: id,
            },
        });
        if (!databaseConnection) {
            return null;
        }
        return database_connection_1.DatabaseConnection.restore({
            id: databaseConnection.id,
            name: databaseConnection.name,
            provider: databaseConnection.provider,
            host: databaseConnection.host,
            port: databaseConnection.port,
            database: databaseConnection.database,
            username: databaseConnection.username,
            password: databaseConnection.password,
            userId: databaseConnection.userId,
        });
    }
    async update(connection) {
        await prisma_client_1.prisma.databaseConnection.update({
            where: {
                id: connection.id,
            },
            data: {
                name: connection.name,
                provider: connection.provider,
                host: connection.host,
                port: connection.port,
                database: connection.database,
                username: connection.username,
                password: connection.password,
            },
        });
    }
    async delete(id) {
        await prisma_client_1.prisma.databaseConnection.delete({
            where: {
                id: id,
            },
        });
    }
}
exports.PrismaDatabaseConnectionRepository = PrismaDatabaseConnectionRepository;
//# sourceMappingURL=prisma-database-connection.repository.js.map