import { Inject, Injectable, Logger } from "@nestjs/common";

import { AlertRuleRepository } from "../repositories/alert-rule-repository";
import { AlertExecutionRepository } from "../repositories/alert-execution-repository";

import { AlertEvaluatorService } from "./alert-evaluator.service";
import { NotificationFactory } from "./notification-factory.service";

import { DatabaseMetrics } from "../../../database-metric/domain/entities/database-metric";

import { CreateAlertExecutionUseCase } from "../use-cases/create-alert-execution/create-alert-execution.use-case";

import { DatabaseConnectionRepository } from "../../../database-connection/application/repositories/database-connection-repository";

@Injectable()
export class AlertProcessorService {
  private readonly logger = new Logger(AlertProcessorService.name);

  constructor(
    @Inject("AlertRuleRepository")
    private readonly alertRuleRepository: AlertRuleRepository,

    @Inject("AlertExecutionRepository")
    private readonly alertExecutionRepository: AlertExecutionRepository,

    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,

    private readonly alertEvaluator: AlertEvaluatorService,

    private readonly createAlertExecutionUseCase: CreateAlertExecutionUseCase,

    @Inject("NotificationFactory")
    private readonly notificationFactory: NotificationFactory,
  ) {}

  async process(metrics: DatabaseMetrics): Promise<void> {
    const rules = await this.alertRuleRepository.findManyByConnectionId(
      metrics.databaseConnectionId,
    );

    const connection = await this.databaseConnectionRepository.findById(
      metrics.databaseConnectionId,
    );

    if (!connection) {
      this.logger.error(
        `Database connection ${metrics.databaseConnectionId} not found.`,
      );

      return;
    }

    const enabledRules = rules.filter((rule) => rule.enabled);

    for (const rule of enabledRules) {
      const matched = this.alertEvaluator.evaluate(rule, metrics);

      if (!matched) {
        continue;
      }

      const execution = await this.createAlertExecutionUseCase.execute(
        rule,
        metrics,
        connection,
      );

      this.logger.warn(
        `[${execution.status}] ${rule.metric} exceeded the threshold (${rule.threshold})`,
      );

      const notification = this.notificationFactory.get(execution.channel);

      try {
        this.logger.log(
          `Sending WhatsApp notification to ${execution.destination}`,
        );

        await notification.send(execution);

        this.logger.log(
          `WhatsApp notification sent to ${execution.destination}`,
        );

        execution.markAsSent();

        await this.alertExecutionRepository.update(execution);
      } catch (error) {
        execution.markAsFailed(
          error instanceof Error ? error.message : "Unknown error",
        );

        await this.alertExecutionRepository.update(execution);

        this.logger.error(
          `Failed to send notification for execution ${execution.id}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }
}
