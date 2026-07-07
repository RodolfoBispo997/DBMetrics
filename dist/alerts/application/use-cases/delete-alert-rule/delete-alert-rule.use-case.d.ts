import { AlertRuleRepository } from "../../repositories/alert-rule-repository";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { DeleteAlertRuleRequestDTO } from "./dto/delete-alert-rule-request.dto";
export declare class DeleteAlertRuleUseCase {
    private readonly alertRuleRepository;
    private readonly databaseConnectionRepository;
    constructor(alertRuleRepository: AlertRuleRepository, databaseConnectionRepository: DatabaseConnectionRepository);
    execute(data: DeleteAlertRuleRequestDTO): Promise<void>;
}
