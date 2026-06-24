import { DatabaseMetricRepository } from "../../application/repositories/database-metric-repository";
import { DatabaseMetrics } from "../../domain/entities/database-metric";
import { prisma } from "../../../user/infra/database/prisma/prisma-client";

export class PrismaDatabaseMetricRepository implements DatabaseMetricRepository {
  async findByConnectionId(connectionId: string): Promise<DatabaseMetrics[]> {
    const metrics = await prisma.databaseMetric.findMany({
      where: {
        databaseConnectionId: connectionId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return metrics.map((metric) =>
      DatabaseMetrics.restore({
        id: metric.id,
        databaseConnectionId: metric.databaseConnectionId,
        databaseVersion: metric.databaseVersion,
        tablesCount: metric.tablesCount,
        databaseSize: metric.databaseSize,
        activeConnections: metric.activeConnections,
        createdAt: metric.createdAt,
      }),
    );
  }

  async findHistoryByConnectionId(data: {
    connectionId: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<DatabaseMetrics[]> {
    const metrics = await prisma.databaseMetric.findMany({
      where: {
        databaseConnectionId: data.connectionId,
        createdAt: {
          gte: data.startDate,
          lte: data.endDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return metrics.map((metric) =>
      DatabaseMetrics.restore({
        id: metric.id,
        databaseConnectionId: metric.databaseConnectionId,
        databaseVersion: metric.databaseVersion,
        tablesCount: metric.tablesCount,
        databaseSize: metric.databaseSize,
        activeConnections: metric.activeConnections,
        createdAt: metric.createdAt,
      }),
    );
  }

  async save(metric: DatabaseMetrics): Promise<void> {
    await prisma.databaseMetric.create({
      data: {
        id: metric.id,
        databaseConnectionId: metric.databaseConnectionId,
        databaseVersion: metric.databaseVersion,
        tablesCount: metric.tablesCount,
        databaseSize: metric.databaseSize,
        activeConnections: metric.activeConnections,
        createdAt: metric.createdAt,
      },
    });
  }
}
