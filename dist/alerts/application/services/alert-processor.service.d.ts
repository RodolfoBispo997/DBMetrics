import { AlertRuleRepository } from "../repositories/alert-rule-repository";
import { AlertEvaluatorService } from "./alert-evaluator.service";
import { DatabaseMetrics } from "../../../database-metric/domain/entities/database-metric";
export declare class AlertProcessorService {
    private readonly alertRuleRepository;
    private readonly alertEvaluator;
    constructor(alertRuleRepository: AlertRuleRepository, alertEvaluator: AlertEvaluatorService);
    process(metrics: DatabaseMetrics): Promise<void>;
}
