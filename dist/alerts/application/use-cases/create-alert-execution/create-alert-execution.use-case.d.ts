import { AlertExecutionRepository } from "../../repositories/alert-execution-repository";
import { AlertExecution } from "../../../domain/entities/alert-execution";
import { AlertRule } from "../../../domain/entities/alert-rule";
import { DatabaseMetrics } from "../../../../database-metric/domain/entities/database-metric";
import { AlertEvaluatorService } from "../../services/alert-evaluator.service";
export declare class CreateAlertExecutionUseCase {
    private readonly alertExecutionRepository;
    private readonly alertEvaluator;
    constructor(alertExecutionRepository: AlertExecutionRepository, alertEvaluator: AlertEvaluatorService);
    execute(rule: AlertRule, metrics: DatabaseMetrics): Promise<AlertExecution>;
}
