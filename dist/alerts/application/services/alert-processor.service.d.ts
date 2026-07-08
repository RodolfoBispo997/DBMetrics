import { AlertRuleRepository } from "../repositories/alert-rule-repository";
import { AlertEvaluatorService } from "./alert-evaluator.service";
import { DatabaseMetrics } from "../../../database-metric/domain/entities/database-metric";
import { CreateAlertExecutionUseCase } from "../use-cases/create-alert-execution/create-alert-execution.use-case";
export declare class AlertProcessorService {
    private readonly alertRuleRepository;
    private readonly alertEvaluator;
    private readonly createAlertExecutionUseCase;
    private readonly logger;
    constructor(alertRuleRepository: AlertRuleRepository, alertEvaluator: AlertEvaluatorService, createAlertExecutionUseCase: CreateAlertExecutionUseCase);
    process(metrics: DatabaseMetrics): Promise<void>;
}
