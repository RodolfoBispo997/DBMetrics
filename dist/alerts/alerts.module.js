"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsModule = void 0;
const common_1 = require("@nestjs/common");
const alerts_controller_1 = require("./alerts.controller");
const create_alert_rule_use_case_1 = require("./application/use-cases/create-alert-rule/create-alert-rule.use-case");
const prisma_alert_rule_repository_1 = require("./infra/repositories/prisma-alert-rule-repository");
const prisma_database_connection_repository_1 = require("../database-connection/infra/repositories/prisma-database-connection.repository");
const get_alert_rule_use_case_1 = require("./application/use-cases/get-alert-rule/get-alert-rule.use-case");
const list_alert_rules_use_case_1 = require("./application/use-cases/list-alert-rules/list-alert-rules.use-case");
const update_alert_rule_use_case_1 = require("./application/use-cases/update-alert-rule/update-alert-rule.use-case");
const enable_alert_rule_use_case_1 = require("./application/use-cases/enable-alert-rule/enable-alert-rule.use-case");
const disable_alert_rule_use_case_1 = require("./application/use-cases/disable-alert-rule/disable-alert-rule.use-case");
const delete_alert_rule_use_case_1 = require("./application/use-cases/delete-alert-rule/delete-alert-rule.use-case");
const alert_evaluator_service_1 = require("./application/services/alert-evaluator.service");
const alert_processor_service_1 = require("./application/services/alert-processor.service");
const prisma_alert_execution_repository_1 = require("./infra/repositories/prisma-alert-execution.repository");
const create_alert_execution_use_case_1 = require("./application/use-cases/create-alert-execution/create-alert-execution.use-case");
const get_alert_execution_use_case_1 = require("./application/use-cases/get-alert-execution/get-alert-execution.use-case");
const list_alert_executions_use_case_1 = require("./application/use-cases/list-alert-executions/list-alert-executions.use-case");
let AlertsModule = class AlertsModule {
};
exports.AlertsModule = AlertsModule;
exports.AlertsModule = AlertsModule = __decorate([
    (0, common_1.Module)({
        controllers: [alerts_controller_1.AlertsController],
        providers: [
            create_alert_rule_use_case_1.CreateAlertRuleUseCase,
            get_alert_rule_use_case_1.GetAlertRuleUseCase,
            list_alert_rules_use_case_1.ListAlertRulesUseCase,
            update_alert_rule_use_case_1.UpdateAlertRuleUseCase,
            enable_alert_rule_use_case_1.EnableAlertRuleUseCase,
            disable_alert_rule_use_case_1.DisableAlertRuleUseCase,
            delete_alert_rule_use_case_1.DeleteAlertRuleUseCase,
            create_alert_execution_use_case_1.CreateAlertExecutionUseCase,
            get_alert_execution_use_case_1.GetAlertExecutionUseCase,
            list_alert_executions_use_case_1.ListAlertExecutionsUseCase,
            alert_evaluator_service_1.AlertEvaluatorService,
            alert_processor_service_1.AlertProcessorService,
            {
                provide: "AlertRuleRepository",
                useClass: prisma_alert_rule_repository_1.PrismaAlertRuleRepository,
            },
            {
                provide: "DatabaseConnectionRepository",
                useClass: prisma_database_connection_repository_1.PrismaDatabaseConnectionRepository,
            },
            {
                provide: "AlertExecutionRepository",
                useClass: prisma_alert_execution_repository_1.PrismaAlertExecutionRepository,
            },
        ],
        exports: [alert_processor_service_1.AlertProcessorService],
    })
], AlertsModule);
//# sourceMappingURL=alerts.module.js.map