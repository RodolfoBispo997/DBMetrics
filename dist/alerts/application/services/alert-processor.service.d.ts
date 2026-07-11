import { AlertRuleRepository } from "../repositories/alert-rule-repository";
import { AlertExecutionRepository } from "../repositories/alert-execution-repository";
import { AlertEvaluatorService } from "./alert-evaluator.service";
import { NotificationFactory } from "./notification-factory.service";
import { DatabaseMetrics } from "../../../database-metric/domain/entities/database-metric";
import { CreateAlertExecutionUseCase } from "../use-cases/create-alert-execution/create-alert-execution.use-case";
import { DatabaseConnectionRepository } from "../../../database-connection/application/repositories/database-connection-repository";
export declare class AlertProcessorService {
    private readonly alertRuleRepository;
    private readonly alertExecutionRepository;
    private readonly databaseConnectionRepository;
    private readonly alertEvaluator;
    private readonly createAlertExecutionUseCase;
    private readonly notificationFactory;
    private readonly logger;
    constructor(alertRuleRepository: AlertRuleRepository, alertExecutionRepository: AlertExecutionRepository, databaseConnectionRepository: DatabaseConnectionRepository, alertEvaluator: AlertEvaluatorService, createAlertExecutionUseCase: CreateAlertExecutionUseCase, notificationFactory: NotificationFactory);
    process(metrics: DatabaseMetrics): Promise<void>;
}
