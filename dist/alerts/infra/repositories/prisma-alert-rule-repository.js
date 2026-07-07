"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAlertRuleRepository = void 0;
const prisma_client_1 = require("../../../user/infra/database/prisma/prisma-client");
const alert_rule_1 = require("../../domain/entities/alert-rule");
class PrismaAlertRuleRepository {
    async save(alertRule) {
        await prisma_client_1.prisma.alertRule.create({
            data: {
                id: alertRule.id,
                metric: alertRule.metric,
                operator: alertRule.operator,
                threshold: alertRule.threshold,
                channel: alertRule.channel,
                enabled: alertRule.enabled,
                databaseConnectionId: alertRule.databaseConnectionId,
                createdAt: alertRule.createdAt,
                updatedAt: alertRule.updatedAt,
            },
        });
    }
    async findById(id) {
        const alertRule = await prisma_client_1.prisma.alertRule.findUnique({
            where: {
                id,
            },
        });
        if (!alertRule) {
            return null;
        }
        return alert_rule_1.AlertRule.restore({
            id: alertRule.id,
            metric: alertRule.metric,
            operator: alertRule.operator,
            threshold: alertRule.threshold,
            channel: alertRule.channel,
            enabled: alertRule.enabled,
            databaseConnectionId: alertRule.databaseConnectionId,
            createdAt: alertRule.createdAt,
            updatedAt: alertRule.updatedAt,
        });
    }
    async findManyByConnectionId(connectionId) {
        const alertRules = await prisma_client_1.prisma.alertRule.findMany({
            where: {
                databaseConnectionId: connectionId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return alertRules.map((alertRule) => alert_rule_1.AlertRule.restore({
            id: alertRule.id,
            metric: alertRule.metric,
            operator: alertRule.operator,
            threshold: alertRule.threshold,
            channel: alertRule.channel,
            enabled: alertRule.enabled,
            databaseConnectionId: alertRule.databaseConnectionId,
            createdAt: alertRule.createdAt,
            updatedAt: alertRule.updatedAt,
        }));
    }
    async update(alertRule) {
        await prisma_client_1.prisma.alertRule.update({
            where: {
                id: alertRule.id,
            },
            data: {
                metric: alertRule.metric,
                operator: alertRule.operator,
                threshold: alertRule.threshold,
                channel: alertRule.channel,
                enabled: alertRule.enabled,
                updatedAt: alertRule.updatedAt,
            },
        });
    }
    async delete(id) {
        await prisma_client_1.prisma.alertRule.delete({
            where: {
                id,
            },
        });
    }
}
exports.PrismaAlertRuleRepository = PrismaAlertRuleRepository;
//# sourceMappingURL=prisma-alert-rule-repository.js.map