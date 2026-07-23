import { Inject, Injectable, Logger } from "@nestjs/common";

import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";

import { RecordDatabaseMetricUseCase } from "../record-database-metric/record-database-metric.use-case";
import { CollectDatabaseMetricsResponseDTO } from "./dto/collect-database-metrics-response.dto";

@Injectable()
export class CollectDatabaseMetricsUseCase {
  private readonly logger = new Logger(CollectDatabaseMetricsUseCase.name);

  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,

    private readonly recordDatabaseMetricUseCase: RecordDatabaseMetricUseCase,
  ) {}

  async execute(): Promise<CollectDatabaseMetricsResponseDTO> {
    const connections = await this.databaseConnectionRepository.findAll();

    let processed = 0;
    let success = 0;
    let failed = 0;

    for (const connection of connections) {
      processed++;

      try {
        await this.recordDatabaseMetricUseCase.execute(connection);

        success++;
      } catch (error) {
        failed++;

        this.logger.error(
          `Failed to collect metrics for connection id=${connection.id} name=${connection.name} provider=${connection.provider}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return {
      processed,
      success,
      failed,
    };
  }
}
