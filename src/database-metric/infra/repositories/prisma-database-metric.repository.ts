import { DatabaseMetricRepository } from "../../application/repositories/database-metric-repository";
import { DatabaseMetrics } from "../../domain/entities/database-metric";
import { prisma } from "../../../user/infra/database/prisma/prisma-client";

export class PrismaDatabaseMetricRepository implements DatabaseMetricRepository {
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
