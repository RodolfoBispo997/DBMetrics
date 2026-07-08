import { Inject, Injectable } from "@nestjs/common";

import { AlertExecutionRepository } from "../../repositories/alert-execution-repository";

import { AlertExecution } from "../../../domain/entities/alert-execution";
import { AlertRule } from "../../../domain/entities/alert-rule";

import { DatabaseMetrics } from "../../../../database-metric/domain/entities/database-metric";

import { AlertEvaluatorService } from "../../services/alert-evaluator.service";

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
  ): Promise<AlertExecution> {
    const execution = AlertExecution.create({
      alertRuleId: rule.id,

      databaseMetricId: metrics.id,
      databaseConnectionId: metrics.databaseConnectionId,

      metric: rule.metric,
      operator: rule.operator,

      metricValue: this.alertEvaluator.getMetricValue(rule.metric, metrics),

      threshold: rule.threshold,

      channel: rule.channel,
    });

    await this.alertExecutionRepository.save(execution);

    return execution;
  }
}
