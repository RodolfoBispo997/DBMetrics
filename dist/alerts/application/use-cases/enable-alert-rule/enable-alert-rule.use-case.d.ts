import { AlertRuleRepository } from "../../repositories/alert-rule-repository";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { EnableAlertRuleRequestDTO } from "./dto/enable-alert-rule-request.dto";
import { EnableAlertRuleResponseDTO } from "./dto/enable-alert-rule-response.dto";
export declare class EnableAlertRuleUseCase {
    private readonly alertRuleRepository;
    private readonly databaseConnectionRepository;
    constructor(alertRuleRepository: AlertRuleRepository, databaseConnectionRepository: DatabaseConnectionRepository);
    execute(data: EnableAlertRuleRequestDTO): Promise<EnableAlertRuleResponseDTO>;
}
