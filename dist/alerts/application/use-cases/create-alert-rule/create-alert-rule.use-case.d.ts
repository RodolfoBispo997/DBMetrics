import { AlertRuleRepository } from "../../repositories/alert-rule-repository";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { CreateAlertRuleRequestDTO } from "./dto/create-alert-rule-request.dto";
import { CreateAlertRuleResponseDTO } from "./dto/create-alert-rule-response.dto";
export declare class CreateAlertRuleUseCase {
    private readonly alertRuleRepository;
    private readonly databaseConnectionRepository;
    constructor(alertRuleRepository: AlertRuleRepository, databaseConnectionRepository: DatabaseConnectionRepository);
    execute(data: CreateAlertRuleRequestDTO): Promise<CreateAlertRuleResponseDTO>;
}
