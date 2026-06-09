"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const user_entity_1 = require("../../domain/entities/user.entity");
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
        return user_entity_1.User.restore({
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
        });
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
        return user_entity_1.User.restore({
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
        });
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