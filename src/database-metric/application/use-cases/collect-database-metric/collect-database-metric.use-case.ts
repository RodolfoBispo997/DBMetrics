import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DatabaseMetricCollectorFactory } from "../../../../database-connection/application/services/database-metric/database-metric-collector-factory";
import { DatabaseConnectionNotFoundError } from "../../../../database-connection/domain/errors/database-connection-not-found-error";
import { DatabaseMetrics } from "../../../domain/entities/database-metric";
import { DatabaseMetricRepository } from "../../repositories/database-metric-repository";

export class CollectDatabaseMetricUseCase {
  constructor(
    private readonly databaseMetricRepository: DatabaseMetricRepository,
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
    private readonly databaseMetricCollectorFactory: DatabaseMetricCollectorFactory,
  ) {}

  async execute(data: CollectDatabaseMetricRequestDTO): Promise<void> {
    const connection = await this.databaseConnectionRepository.findById(
      data.connectionId,
    );

    if (!connection) {
      throw new DatabaseConnectionNotFoundError(
        "Database connection not found",
      );
    }

    if (connection.userId !== data.userId) {
      throw new DatabaseConnectionNotFoundError(
        "Database connection not found",
      );
    }

    const collet = this.databaseMetricCollectorFactory.get(connection.provider);

    const result = await collet.collect(connection);

    const databaseMetrics = DatabaseMetrics.create({
      databaseConnectionId: connection.id,
      databaseVersion: result.databaseVersion,
      tablesCount: result.tablesCount,
      databaseSize: result.databaseSize,
      activeConnections: result.activeConnections,
    });

    await this.databaseMetricRepository.save(databaseMetrics);
  }
}
