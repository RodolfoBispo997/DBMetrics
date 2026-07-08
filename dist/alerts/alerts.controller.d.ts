import { CreateAlertRuleBodyHttpDTO } from "./presentation/dto/create-alert-rule-body-http.dto";
import { CreateAlertRuleUseCase } from "./application/use-cases/create-alert-rule/create-alert-rule.use-case";
import { GetAlertRuleUseCase } from "./application/use-cases/get-alert-rule/get-alert-rule.use-case";
import { ListAlertRulesUseCase } from "./application/use-cases/list-alert-rules/list-alert-rules.use-case";
import { UpdateAlertRuleBodyHttpDTO } from "./presentation/dto/update-alert-rule-body-http.dto";
import { UpdateAlertRuleUseCase } from "./application/use-cases/update-alert-rule/update-alert-rule.use-case";
import { EnableAlertRuleUseCase } from "./application/use-cases/enable-alert-rule/enable-alert-rule.use-case";
import { DisableAlertRuleUseCase } from "./application/use-cases/disable-alert-rule/disable-alert-rule.use-case";
import { DeleteAlertRuleUseCase } from "./application/use-cases/delete-alert-rule/delete-alert-rule.use-case";
export declare class AlertsController {
    private readonly createAlertRuleUseCase;
    private readonly getAlertRuleUseCase;
    private readonly listAlertRulesUseCase;
    private readonly updateAlertRuleUseCase;
    private readonly enableAlertRuleUseCase;
    private readonly disableAlertRuleUseCase;
    private readonly deleteAlertRuleUseCase;
    constructor(createAlertRuleUseCase: CreateAlertRuleUseCase, getAlertRuleUseCase: GetAlertRuleUseCase, listAlertRulesUseCase: ListAlertRulesUseCase, updateAlertRuleUseCase: UpdateAlertRuleUseCase, enableAlertRuleUseCase: EnableAlertRuleUseCase, disableAlertRuleUseCase: DisableAlertRuleUseCase, deleteAlertRuleUseCase: DeleteAlertRuleUseCase);
    create(body: CreateAlertRuleBodyHttpDTO, request: any): Promise<import("./application/use-cases/create-alert-rule/dto/create-alert-rule-response.dto").CreateAlertRuleResponseDTO>;
    get(alertRuleId: string, request: any): Promise<import("./application/use-cases/get-alert-rule/dto/get-alert-rule-response.dto").GetAlertRuleResponseDTO>;
    list(connectionId: string, request: any): Promise<import("./application/use-cases/list-alert-rules/dto/list-alert-rules-response.dto").ListAlertRulesResponseDTO>;
    update(alertRuleId: string, body: UpdateAlertRuleBodyHttpDTO, request: any): Promise<import("./application/use-cases/update-alert-rule/dto/update-alert-rule-response.dto").UpdateAlertRuleResponseDTO>;
    enable(alertRuleId: string, request: any): Promise<void>;
    disable(alertRuleId: string, request: any): Promise<void>;
    delete(alertRuleId: string, request: any): Promise<void>;
}
