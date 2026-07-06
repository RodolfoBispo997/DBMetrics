import { Inject, Injectable } from "@nestjs/common";

import { DatabaseConnection } from "../../../../database-connection/domain/entities/database-connection";

import { DatabaseMetricCollectorFactory } from "../../../../database-connection/application/services/database-metric/database-metric-collector-factory";

import { DatabaseMetricRepository } from "../../repositories/database-metric-repository";

import { DatabaseMetrics } from "../../../domain/entities/database-metric";

@Injectable()
export class RecordDatabaseMetricUseCase {
  constructor(
    @Inject("DatabaseMetricRepository")
    private readonly databaseMetricRepository: DatabaseMetricRepository,

    @Inject("DatabaseMetricCollectorFactory")
    private readonly databaseMetricCollectorFactory: DatabaseMetricCollectorFactory,
  ) {}

  async execute(connection: DatabaseConnection): Promise<DatabaseMetrics> {
    const collector = this.databaseMetricCollectorFactory.get(
      connection.provider,
    );

    const result = await collector.collect(connection);

    const databaseMetric = DatabaseMetrics.create({
      databaseConnectionId: connection.id,

      databaseVersion: result.databaseVersion,

      tablesCount: result.tablesCount,
      viewsCount: result.viewsCount,
      schemasCount: result.schemasCount,
      indexesCount: result.indexesCount,
      functionsCount: result.functionsCount,

      databaseSize: result.databaseSize,
      activeConnections: result.activeConnections,
    });

    await this.databaseMetricRepository.save(databaseMetric);

    return databaseMetric;
  }
}
