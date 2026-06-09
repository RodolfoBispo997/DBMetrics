"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaDatabaseConnectionRepository = void 0;
const prisma_client_1 = require("../../../user/infra/database/prisma/prisma-client");
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
        return databaseConnections;
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
        return databaseConnection;
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
}
exports.PrismaDatabaseConnectionRepository = PrismaDatabaseConnectionRepository;
//# sourceMappingURL=prisma-database-connection.repository.js.map