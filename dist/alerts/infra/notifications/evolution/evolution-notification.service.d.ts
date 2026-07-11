import { NotificationService } from "../../../application/services/notification.service";
import { AlertExecution } from "../../../domain/entities/alert-execution";
import { AlertExecutionRepository } from "../../../application/repositories/alert-execution-repository";
import { EvolutionService } from "../../../../shared/integrations/evolution/evolution.service";
export declare class EvolutionNotificationService implements NotificationService {
    private readonly evolutionService;
    private readonly alertExecutionRepository;
    constructor(evolutionService: EvolutionService, alertExecutionRepository: AlertExecutionRepository);
    send(execution: AlertExecution): Promise<void>;
}
