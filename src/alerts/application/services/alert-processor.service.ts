import { Inject, Injectable, Logger } from "@nestjs/common";

import { AlertRuleRepository } from "../repositories/alert-rule-repository";
import { AlertExecutionRepository } from "../repositories/alert-execution-repository";
import { AlertEvaluatorService } from "./alert-evaluator.service";
import { NotificationFactory } from "./notification-factory.service";
import { CreateAlertExecutionUseCase } from "../use-cases/create-alert-execution/create-alert-execution.use-case";

import { DatabaseMetrics } from "../../../database-metric/domain/entities/database-metric";
import { DatabaseConnection } from "../../../database-connection/domain/entities/database-connection";
import { DatabaseConnectionRepository } from "../../../database-connection/application/repositories/database-connection-repository";
import { AlertRule } from "../../domain/entities/alert-rule";
import { AlertRuleState } from "../../domain/enums/alert-rule-state.enum";

@Injectable()
export class AlertProcessorService {
  private readonly logger = new Logger(AlertProcessorService.name);
  private readonly processingRuleIds = new Set<string>();

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
    if (this.processingRuleIds.has(rule.id)) {
      this.logger.debug(
        `Alert rule ${rule.id} is already being processed and was skipped`,
      );
      return;
    }

    this.processingRuleIds.add(rule.id);

    try {
      const thresholdViolated = this.alertEvaluator.evaluate(rule, metrics);

      if (!thresholdViolated) {
        await this.handleRecoveredRule(rule);
        return;
      }

      const isFirstViolation = rule.currentState === AlertRuleState.NORMAL;

      if (isFirstViolation) {
        rule.markAsTriggered();

        if (!(await this.persistRuleState(rule))) {
          return;
        }

        this.logger.warn(`Alert rule ${rule.id} transitioned to TRIGGERED state`);
      }

      if (!rule.canNotify()) {
        this.logger.debug(
          `Alert rule ${rule.id} notification suppressed by active cooldown`,
        );
        return;
      }

      this.logger.log(
        isFirstViolation
          ? `Sending first notification for alert rule ${rule.id}`
          : `Sending reminder notification for alert rule ${rule.id} after cooldown`,
      );

      const execution = await this.createAlertExecutionUseCase.execute(
        rule,
        metrics,
        connection,
      );

      let notificationSent = false;

      try {
        const notification = this.notificationFactory.get(execution.channel);
        await notification.send(execution);
        execution.markAsSent();
        notificationSent = true;
        this.logger.log(`Notification sent for alert rule ${rule.id}`);
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
        return;
      }

      if (!notificationSent) {
        return;
      }

      const sentAt = execution.sentAt;

      if (!sentAt) {
        this.logger.error(
          `Successful execution ${execution.id} has no sentAt timestamp`,
        );
        return;
      }

      rule.registerSuccessfulNotification(sentAt);
      const notificationStatePersisted = await this.persistRuleState(rule);

      if (!notificationStatePersisted) {
        this.logger.error(
          `Notification for alert rule ${rule.id} was sent and execution ${execution.id} is SENT, but lastNotificationAt could not be persisted. A duplicate notification may occur on the next collection.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to process alert rule ${rule.id}`,
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.processingRuleIds.delete(rule.id);
    }
  }

  private async handleRecoveredRule(rule: AlertRule): Promise<void> {
    if (rule.currentState === AlertRuleState.NORMAL) {
      return;
    }

    rule.markAsNormal();

    if (await this.persistRuleState(rule)) {
      this.logger.log(
        `Alert rule ${rule.id} recovered and returned to NORMAL state`,
      );
    }
  }

  private async persistRuleState(rule: AlertRule): Promise<boolean> {
    try {
      await this.alertRuleRepository.update(rule);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to persist state for alert rule ${rule.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }
}
