import { AlertRuleRepository } from "../../repositories/alert-rule-repository";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { UpdateAlertRuleRequestDTO } from "./dto/update-alert-rule-request.dto";
import { UpdateAlertRuleResponseDTO } from "./dto/update-alert-rule-response.dto";
export declare class UpdateAlertRuleUseCase {
    private readonly alertRuleRepository;
    private readonly databaseConnectionRepository;
    constructor(alertRuleRepository: AlertRuleRepository, databaseConnectionRepository: DatabaseConnectionRepository);
    execute(data: UpdateAlertRuleRequestDTO): Promise<UpdateAlertRuleResponseDTO>;
}
