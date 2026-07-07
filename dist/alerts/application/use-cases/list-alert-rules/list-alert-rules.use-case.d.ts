import { AlertRuleRepository } from "../../repositories/alert-rule-repository";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { ListAlertRulesRequestDTO } from "./dto/list-alert-rules-request.dto";
import { ListAlertRulesResponseDTO } from "./dto/list-alert-rules-response.dto";
export declare class ListAlertRulesUseCase {
    private readonly alertRuleRepository;
    private readonly databaseConnectionRepository;
    constructor(alertRuleRepository: AlertRuleRepository, databaseConnectionRepository: DatabaseConnectionRepository);
    execute(data: ListAlertRulesRequestDTO): Promise<ListAlertRulesResponseDTO>;
}
