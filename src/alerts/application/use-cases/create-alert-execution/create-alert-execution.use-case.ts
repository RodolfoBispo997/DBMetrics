import { Inject, Injectable } from "@nestjs/common";

import { AlertExecutionRepository } from "../../repositories/alert-execution-repository";

import { AlertExecution } from "../../../domain/entities/alert-execution";
import { AlertOutboxEvent } from "../../../domain/entities/alert-outbox-event";
import { AlertRule } from "../../../domain/entities/alert-rule";

import { DatabaseMetrics } from "../../../../database-metric/domain/entities/database-metric";

import { AlertEvaluatorService } from "../../services/alert-evaluator.service";
import { DatabaseConnection } from "../../../../database-connection/domain/entities/database-connection";

@Injectable()
export class CreateAlertExecutionUseCase {
  constructor(
    @Inject("AlertExecutionRepository")
    private readonly alertExecutionRepository: AlertExecutionRepository,

    private readonly alertEvaluator: AlertEvaluatorService,
  ) {}

  async execute(
    rule: AlertRule,
    metrics: DatabaseMetrics,
    connection: DatabaseConnection,
  ): Promise<AlertExecution | null> {
    const execution = AlertExecution.create({
      alertRuleId: rule.id,

      databaseMetricId: metrics.id,
      databaseConnectionId: metrics.databaseConnectionId,
      connectionName: connection.name,
      databaseProvider: connection.provider,
      host: connection.host,
      databaseName: connection.database,
      port: connection.port,
      metric: rule.metric,
      operator: rule.operator,
      metricValue: this.alertEvaluator.getMetricValue(rule.metric, metrics),
      threshold: rule.threshold,
      channel: rule.channel,
      destination: rule.destination,
    });

    let outboxEvent: AlertOutboxEvent | undefined;
    if (process.env.ALERT_ASYNC_DELIVERY_ENABLED === "true") {
      outboxEvent = AlertOutboxEvent.create(
        {
          alertExecutionId: execution.id,
          channel: execution.channel,
          destination: execution.destination,
          executedAt: execution.triggeredAt.toISOString(),
        },
        execution.id,
        execution.id,
      );

    }

    const saved = await this.alertExecutionRepository.saveIfNotificationEligible(
      execution,
      outboxEvent,
    );
    return saved ? execution : null;
  }
}
