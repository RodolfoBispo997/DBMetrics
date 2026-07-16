import { DatabaseMetricRepository } from "../../application/repositories/database-metric-repository";
import { DatabaseMetrics } from "../../domain/entities/database-metric";
import { prisma } from "../../../user/infra/database/prisma/prisma-client";
import { Prisma } from "../../../../generated/prisma/client";

type DatabaseMetricRow = {
  id: string;
  databaseConnectionId: string;
  databaseVersion: string;
  tablesCount: number;
  viewsCount: number;
  schemasCount: number;
  indexesCount: number;
  functionsCount: number;
  databaseSize: number;
  activeConnections: number;
  createdAt: Date;
};

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
        viewsCount: metric.viewsCount,
        schemasCount: metric.schemasCount,
        indexesCount: metric.indexesCount,
        functionsCount: metric.functionsCount,

        databaseSize: metric.databaseSize,
        activeConnections: metric.activeConnections,

        createdAt: metric.createdAt,
      }),
    );
  }

  async findHistoryByConnectionId(data: {
    connectionId: string;
    startDate: Date;
    endDate: Date;
    order?: "asc" | "desc";
    limit?: number;
  }): Promise<DatabaseMetrics[]> {
    const order = data.order ?? "desc";
    const metrics = await prisma.databaseMetric.findMany({
      where: {
        databaseConnectionId: data.connectionId,
        createdAt: {
          gte: data.startDate,
          lte: data.endDate,
        },
      },
      orderBy: [{ createdAt: order }, { id: order }],
      take: data.limit,
    });

    return metrics.map((metric) =>
      DatabaseMetrics.restore({
        id: metric.id,
        databaseConnectionId: metric.databaseConnectionId,

        databaseVersion: metric.databaseVersion,

        tablesCount: metric.tablesCount,
        viewsCount: metric.viewsCount,
        schemasCount: metric.schemasCount,
        indexesCount: metric.indexesCount,
        functionsCount: metric.functionsCount,

        databaseSize: metric.databaseSize,
        activeConnections: metric.activeConnections,

        createdAt: metric.createdAt,
      }),
    );
  }

  async findLatestByConnectionIds(
    connectionIds: string[],
  ): Promise<Map<string, DatabaseMetrics>> {
    if (connectionIds.length === 0) {
      return new Map();
    }

    const metrics = await prisma.$queryRaw<DatabaseMetricRow[]>(Prisma.sql`
      SELECT DISTINCT ON ("databaseConnectionId")
        "id",
        "databaseConnectionId",
        "databaseVersion",
        "tablesCount",
        "viewsCount",
        "schemasCount",
        "indexesCount",
        "functionsCount",
        "databaseSize",
        "activeConnections",
        "createdAt"
      FROM "database_metrics"
      WHERE "databaseConnectionId" IN (${Prisma.join(connectionIds)})
      ORDER BY "databaseConnectionId", "createdAt" DESC, "id" DESC
    `);

    return new Map(
      metrics.map((metric) => [
        metric.databaseConnectionId,
        DatabaseMetrics.restore(metric),
      ]),
    );
  }

  async findLatestByConnectionId(
    connectionId: string,
  ): Promise<DatabaseMetrics | null> {
    const metric = await prisma.databaseMetric.findFirst({
      where: {
        databaseConnectionId: connectionId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!metric) {
      return null;
    }

    return DatabaseMetrics.restore({
      id: metric.id,
      databaseConnectionId: metric.databaseConnectionId,

      databaseVersion: metric.databaseVersion,

      tablesCount: metric.tablesCount,
      viewsCount: metric.viewsCount,
      schemasCount: metric.schemasCount,
      indexesCount: metric.indexesCount,
      functionsCount: metric.functionsCount,

      databaseSize: metric.databaseSize,
      activeConnections: metric.activeConnections,

      createdAt: metric.createdAt,
    });
  }

  async save(metric: DatabaseMetrics): Promise<void> {
    await prisma.databaseMetric.create({
      data: {
        id: metric.id,

        databaseConnectionId: metric.databaseConnectionId,

        databaseVersion: metric.databaseVersion,

        tablesCount: metric.tablesCount,
        viewsCount: metric.viewsCount,
        schemasCount: metric.schemasCount,
        indexesCount: metric.indexesCount,
        functionsCount: metric.functionsCount,

        databaseSize: metric.databaseSize,

        activeConnections: metric.activeConnections,

        createdAt: metric.createdAt,
      },
    });
  }
}
