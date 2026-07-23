import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import { CollectDatabaseMetricsUseCase } from "../../application/use-cases/collect-database-metrics/collect-database-metrics.use-case";
import { getEnvironmentConfig } from "../../../shared/config/environment.config";

function DatabaseMetricsCron(): MethodDecorator {
  // Scheduler configuration is resolved during module initialization.
  const schedulerConfig = getEnvironmentConfig().scheduler.databaseMetrics;

  return Cron(schedulerConfig.cron, {
    name: "database-metrics-collection",
    waitForCompletion: true,
    disabled: !schedulerConfig.enabled,
  });
}

@Injectable()
export class DatabaseMetricScheduler {
  private readonly logger = new Logger(DatabaseMetricScheduler.name);

  constructor(
    private readonly collectDatabaseMetricsUseCase: CollectDatabaseMetricsUseCase,
  ) {}

  @DatabaseMetricsCron()
  async handleDatabaseMetricsCollection(): Promise<void> {
    const startedAt = Date.now();
    this.logger.log("Starting scheduled database metrics collection...");

    try {
      const result = await this.collectDatabaseMetricsUseCase.execute();
      const durationMs = Date.now() - startedAt;

      this.logger.log(
        `Scheduled database metrics collection finished: processed=${result.processed} success=${result.success} failed=${result.failed} durationMs=${durationMs}`,
      );
    } catch (error) {
      const durationMs = Date.now() - startedAt;

      this.logger.error(
        `Scheduled database metrics collection failed globally after durationMs=${durationMs}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
