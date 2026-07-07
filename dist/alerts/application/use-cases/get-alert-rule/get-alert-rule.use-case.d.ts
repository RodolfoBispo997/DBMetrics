import { AlertRuleRepository } from "../../repositories/alert-rule-repository";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { GetAlertRuleRequestDTO } from "./dto/get-alert-rule-request.dto";
import { GetAlertRuleResponseDTO } from "./dto/get-alert-rule-response.dto";
export declare class GetAlertRuleUseCase {
    private readonly alertRuleRepository;
    private readonly databaseConnectionRepository;
    constructor(alertRuleRepository: AlertRuleRepository, databaseConnectionRepository: DatabaseConnectionRepository);
    execute(data: GetAlertRuleRequestDTO): Promise<GetAlertRuleResponseDTO>;
}
