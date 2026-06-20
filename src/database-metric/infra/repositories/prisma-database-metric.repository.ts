import { DatabaseMetricRepository } from "../../application/repositories/database-metric-repository";
import { DatabaseMetrics } from "../../domain/entities/database-metric";
import { prisma } from "../../../user/infra/database/prisma/prisma-client";

export class PrismaDatabaseMetricRepository implements DatabaseMetricRepository {
  async findByConnectionId(connectionId: string): Promise<DatabaseMetrics[]> {
    const connection = await prisma.databaseMetric.findMany({
      where: {
        databaseConnectionId: connectionId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return connection.map((connection) =>
      DatabaseMetrics.restore({
        id: connection.id,
        databaseConnectionId: connection.databaseConnectionId,
        databaseVersion: connection.databaseVersion,
        tablesCount: connection.tablesCount,
        databaseSize: connection.databaseSize,
        activeConnections: connection.activeConnections,
        createdAt: connection.createdAt,
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
