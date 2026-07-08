import { Inject, Injectable, Logger } from "@nestjs/common";
import { AlertRuleRepository } from "../repositories/alert-rule-repository";
import { AlertEvaluatorService } from "./alert-evaluator.service";
import { DatabaseMetrics } from "../../../database-metric/domain/entities/database-metric";

@Injectable()
export class AlertProcessorService {
  private readonly logger = new Logger(AlertProcessorService.name);
  constructor(
    @Inject("AlertRuleRepository")
    private readonly alertRuleRepository: AlertRuleRepository,

    private readonly alertEvaluator: AlertEvaluatorService,
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

      this.logger.warn(
        `[ALERT] ${rule.metric} excedeu o limite (${rule.threshold})`,
      );
    }
  }
}
