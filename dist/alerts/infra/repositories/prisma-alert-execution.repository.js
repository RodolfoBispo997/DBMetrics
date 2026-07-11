"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAlertExecutionRepository = void 0;
const prisma_client_1 = require("../../../user/infra/database/prisma/prisma-client");
const alert_execution_1 = require("../../domain/entities/alert-execution");
class PrismaAlertExecutionRepository {
    async save(alertExecution) {
        await prisma_client_1.prisma.alertExecution.create({
            data: {
                id: alertExecution.id,
                alertRuleId: alertExecution.alertRuleId,
                databaseMetricId: alertExecution.databaseMetricId,
                databaseConnectionId: alertExecution.databaseConnectionId,
                connectionName: alertExecution.connectionName,
                databaseProvider: alertExecution.databaseProvider,
                host: alertExecution.host,
                databaseName: alertExecution.databaseName,
                port: alertExecution.port,
                metric: alertExecution.metric,
                operator: alertExecution.operator,
                metricValue: alertExecution.metricValue,
                threshold: alertExecution.threshold,
                destination: alertExecution.destination,
                channel: alertExecution.channel,
                status: alertExecution.status,
                errorMessage: alertExecution.errorMessage,
                triggeredAt: alertExecution.triggeredAt,
                sentAt: alertExecution.sentAt,
            },
        });
    }
    async update(alertExecution) {
        await prisma_client_1.prisma.alertExecution.update({
            where: {
                id: alertExecution.id,
            },
            data: {
                status: alertExecution.status,
                errorMessage: alertExecution.errorMessage,
                sentAt: alertExecution.sentAt,
            },
        });
    }
    async findById(id) {
        const execution = await prisma_client_1.prisma.alertExecution.findUnique({
            where: {
                id,
            },
        });
        if (!execution) {
            return null;
        }
        return alert_execution_1.AlertExecution.restore({
            id: execution.id,
            alertRuleId: execution.alertRuleId,
            databaseMetricId: execution.databaseMetricId,
            databaseConnectionId: execution.databaseConnectionId,
            connectionName: execution.connectionName,
            databaseProvider: execution.databaseProvider,
            host: execution.host,
            databaseName: execution.databaseName,
            port: execution.port,
            metric: execution.metric,
            operator: execution.operator,
            metricValue: execution.metricValue,
            threshold: execution.threshold,
            channel: execution.channel,
            destination: execution.destination,
            status: execution.status,
            errorMessage: execution.errorMessage ?? undefined,
            triggeredAt: execution.triggeredAt,
            sentAt: execution.sentAt ?? undefined,
        });
    }
    async findManyByConnectionId(connectionId) {
        const executions = await prisma_client_1.prisma.alertExecution.findMany({
            where: {
                databaseConnectionId: connectionId,
            },
            orderBy: {
                triggeredAt: "desc",
            },
        });
        return executions.map((execution) => alert_execution_1.AlertExecution.restore({
            id: execution.id,
            alertRuleId: execution.alertRuleId,
            databaseMetricId: execution.databaseMetricId,
            databaseConnectionId: execution.databaseConnectionId,
            connectionName: execution.connectionName,
            databaseProvider: execution.databaseProvider,
            host: execution.host,
            databaseName: execution.databaseName,
            port: execution.port,
            metric: execution.metric,
            operator: execution.operator,
            metricValue: execution.metricValue,
            threshold: execution.threshold,
            channel: execution.channel,
            destination: execution.destination,
            status: execution.status,
            errorMessage: execution.errorMessage ?? undefined,
            triggeredAt: execution.triggeredAt,
            sentAt: execution.sentAt ?? undefined,
        }));
    }
    async findRecent(limit) {
        const executions = await prisma_client_1.prisma.alertExecution.findMany({
            take: limit,
            orderBy: {
                triggeredAt: "desc",
            },
        });
        return executions.map((execution) => alert_execution_1.AlertExecution.restore({
            id: execution.id,
            alertRuleId: execution.alertRuleId,
            databaseMetricId: execution.databaseMetricId,
            databaseConnectionId: execution.databaseConnectionId,
            connectionName: execution.connectionName,
            databaseProvider: execution.databaseProvider,
            host: execution.host,
            databaseName: execution.databaseName,
            port: execution.port,
            metric: execution.metric,
            operator: execution.operator,
            metricValue: execution.metricValue,
            threshold: execution.threshold,
            channel: execution.channel,
            destination: execution.destination,
            status: execution.status,
            errorMessage: execution.errorMessage ?? undefined,
            triggeredAt: execution.triggeredAt,
            sentAt: execution.sentAt ?? undefined,
        }));
    }
}
exports.PrismaAlertExecutionRepository = PrismaAlertExecutionRepository;
//# sourceMappingURL=prisma-alert-execution.repository.js.map