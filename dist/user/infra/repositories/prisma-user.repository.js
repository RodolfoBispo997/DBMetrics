"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const prisma_client_1 = require("../database/prisma/prisma-client");
class PrismaUserRepository {
    async findByEmail(email) {
        const user = await prisma_client_1.prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            return null;
        }
        return user;
    }
    async findById(id) {
        const user = await prisma_client_1.prisma.user.findUnique({
            where: {
                id,
            },
        });
        if (!user) {
            return null;
        }
        return user;
    }
    async save(user) {
        await prisma_client_1.prisma.user.create({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
                role: user.role,
            },
        });
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
//# sourceMappingURL=prisma-user.repository.js.map