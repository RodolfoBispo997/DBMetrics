import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { CollectDatabaseMetricsUseCase } from "../../application/use-cases/collect-database-metrics/collect-database-metrics.use-case";

@Injectable()
export class DatabaseMetricScheduler {
  private readonly logger = new Logger(DatabaseMetricScheduler.name);

  constructor(
    private readonly collectDatabaseMetricsUseCase: CollectDatabaseMetricsUseCase,
  ) {}

  // @Cron(CronExpression.EVERY_5_MINUTES)
  // @Cron(CronExpression.EVERY_30_SECONDS)
  async handleDatabaseMetricsCollection(): Promise<void> {
    this.logger.log("Starting metrics collection...");

    const result = await this.collectDatabaseMetricsUseCase.execute();

    this.logger.log(
      `Metrics collection finished: ${result.success}/${result.processed} successful (${result.failed} failed)`,
    );
  }
}
