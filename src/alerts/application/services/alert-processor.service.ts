import { Inject, Injectable, Logger } from "@nestjs/common";

import { AlertRuleRepository } from "../repositories/alert-rule-repository";
import { AlertExecutionRepository } from "../repositories/alert-execution-repository";

import { AlertEvaluatorService } from "./alert-evaluator.service";
import { NotificationFactory } from "./notification-factory.service";

import { DatabaseMetrics } from "../../../database-metric/domain/entities/database-metric";
import { DatabaseConnection } from "../../../database-connection/domain/entities/database-connection";
import { AlertRule } from "../../domain/entities/alert-rule";

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
    try {
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

      for (const rule of rules.filter((candidate) => candidate.enabled)) {
        await this.processRule(rule, metrics, connection);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process alerts for metric ${metrics.id}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async processRule(
    rule: AlertRule,
    metrics: DatabaseMetrics,
    connection: DatabaseConnection,
  ): Promise<void> {
    try {
      if (!this.alertEvaluator.evaluate(rule, metrics)) {
        return;
      }

      const execution = await this.createAlertExecutionUseCase.execute(
        rule,
        metrics,
        connection,
      );

      this.logger.warn(
        `[${execution.status}] ${rule.metric} matched its threshold (${rule.threshold})`,
      );

      try {
        const notification = this.notificationFactory.get(execution.channel);
        this.logger.log(`Sending notification to ${execution.destination}`);
        await notification.send(execution);
        execution.markAsSent();
        this.logger.log(`Notification sent to ${execution.destination}`);
      } catch (error) {
        execution.markAsFailed(
          error instanceof Error ? error.message : "Unknown error",
        );
        this.logger.error(
          `Failed to send notification for execution ${execution.id}`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      try {
        await this.alertExecutionRepository.update(execution);
      } catch (error) {
        this.logger.error(
          `Failed to persist execution ${execution.id}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to process alert rule ${rule.id}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
