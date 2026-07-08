import { Inject, Injectable, Logger } from "@nestjs/common";
import { AlertRuleRepository } from "../repositories/alert-rule-repository";
import { AlertEvaluatorService } from "./alert-evaluator.service";
import { DatabaseMetrics } from "../../../database-metric/domain/entities/database-metric";
import { CreateAlertExecutionUseCase } from "../use-cases/create-alert-execution/create-alert-execution.use-case";

@Injectable()
export class AlertProcessorService {
  private readonly logger = new Logger(AlertProcessorService.name);
  constructor(
    @Inject("AlertRuleRepository")
    private readonly alertRuleRepository: AlertRuleRepository,

    private readonly alertEvaluator: AlertEvaluatorService,

    private readonly createAlertExecutionUseCase: CreateAlertExecutionUseCase,
  ) {}

  async process(metrics: DatabaseMetrics): Promise<void> {
    const rules = await this.alertRuleRepository.findManyByConnectionId(
      metrics.databaseConnectionId,
    );

    const enabledRules = rules.filter((rule) => rule.enabled);

    for (const rule of enabledRules) {
      const matched = this.alertEvaluator.evaluate(rule, metrics);

      if (!matched) {
        continue;
      }

      const execution = await this.createAlertExecutionUseCase.execute(
        rule,
        metrics,
      );

      this.logger.warn(
        `[${execution.status}] ${rule.metric} excedeu o limite (${rule.threshold})`,
      );
    }
  }
}
