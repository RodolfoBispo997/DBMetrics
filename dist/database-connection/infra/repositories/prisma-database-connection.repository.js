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
}
exports.PrismaDatabaseConnectionRepository = PrismaDatabaseConnectionRepository;
//# sourceMappingURL=prisma-database-connection.repository.js.map