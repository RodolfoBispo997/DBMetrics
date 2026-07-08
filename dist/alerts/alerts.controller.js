"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsController = void 0;
const common_1 = require("@nestjs/common");
const create_alert_rule_body_http_dto_1 = require("./presentation/dto/create-alert-rule-body-http.dto");
const create_alert_rule_use_case_1 = require("./application/use-cases/create-alert-rule/create-alert-rule.use-case");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_alert_rule_use_case_1 = require("./application/use-cases/get-alert-rule/get-alert-rule.use-case");
const list_alert_rules_use_case_1 = require("./application/use-cases/list-alert-rules/list-alert-rules.use-case");
const update_alert_rule_body_http_dto_1 = require("./presentation/dto/update-alert-rule-body-http.dto");
const update_alert_rule_use_case_1 = require("./application/use-cases/update-alert-rule/update-alert-rule.use-case");
const enable_alert_rule_use_case_1 = require("./application/use-cases/enable-alert-rule/enable-alert-rule.use-case");
const disable_alert_rule_use_case_1 = require("./application/use-cases/disable-alert-rule/disable-alert-rule.use-case");
const delete_alert_rule_use_case_1 = require("./application/use-cases/delete-alert-rule/delete-alert-rule.use-case");
const get_alert_execution_use_case_1 = require("./application/use-cases/get-alert-execution/get-alert-execution.use-case");
const list_alert_executions_use_case_1 = require("./application/use-cases/list-alert-executions/list-alert-executions.use-case");
const alert_execution_presenter_1 = require("./presentation/presenters/alert-execution.presenter");
let AlertsController = class AlertsController {
    constructor(createAlertRuleUseCase, getAlertRuleUseCase, listAlertRulesUseCase, updateAlertRuleUseCase, enableAlertRuleUseCase, disableAlertRuleUseCase, deleteAlertRuleUseCase, getAlertExecutionUseCase, listAlertExecutionsUseCase) {
        this.createAlertRuleUseCase = createAlertRuleUseCase;
        this.getAlertRuleUseCase = getAlertRuleUseCase;
        this.listAlertRulesUseCase = listAlertRulesUseCase;
        this.updateAlertRuleUseCase = updateAlertRuleUseCase;
        this.enableAlertRuleUseCase = enableAlertRuleUseCase;
        this.disableAlertRuleUseCase = disableAlertRuleUseCase;
        this.deleteAlertRuleUseCase = deleteAlertRuleUseCase;
        this.getAlertExecutionUseCase = getAlertExecutionUseCase;
        this.listAlertExecutionsUseCase = listAlertExecutionsUseCase;
    }
    async create(body, request) {
        return this.createAlertRuleUseCase.execute({
            userId: request.user.userId,
            connectionId: body.connectionId,
            metric: body.metric,
            operator: body.operator,
            threshold: body.threshold,
            channel: body.channel,
        });
    }
    async get(alertRuleId, request) {
        return this.getAlertRuleUseCase.execute({
            userId: request.user.userId,
            alertRuleId,
        });
    }
    async list(connectionId, request) {
        return this.listAlertRulesUseCase.execute({
            userId: request.user.userId,
            connectionId,
        });
    }
    async update(alertRuleId, body, request) {
        return this.updateAlertRuleUseCase.execute({
            userId: request.user.userId,
            alertRuleId,
            metric: body.metric,
            operator: body.operator,
            threshold: body.threshold,
            channel: body.channel,
        });
    }
    async enable(alertRuleId, request) {
        return this.enableAlertRuleUseCase.execute({
            userId: request.user.userId,
            alertRuleId,
        });
    }
    async disable(alertRuleId, request) {
        return this.disableAlertRuleUseCase.execute({
            userId: request.user.userId,
            alertRuleId,
        });
    }
    async delete(alertRuleId, request) {
        return this.deleteAlertRuleUseCase.execute({
            userId: request.user.userId,
            alertRuleId,
        });
    }
    async getExecution(executionId, request) {
        return this.getAlertExecutionUseCase.execute({
            executionId,
            userId: request.user.userId,
        });
    }
    async listExecutions(connectionId, request) {
        const rules = await this.listAlertExecutionsUseCase.execute({
            connectionId,
            userId: request.user.userId,
        });
        return rules.map(alert_execution_presenter_1.AlertExecutionPresenter.toHTTP);
    }
};
exports.AlertsController = AlertsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_alert_rule_body_http_dto_1.CreateAlertRuleBodyHttpDTO, Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "get", null);
__decorate([
    (0, common_1.Get)("/connection/:connectionId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("connectionId")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_alert_rule_body_http_dto_1.UpdateAlertRuleBodyHttpDTO, Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(":id/enable"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "enable", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(":id/disable"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "disable", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(":id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "delete", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("/executions/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "getExecution", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("/connection/:connectionId/executions"),
    __param(0, (0, common_1.Param)("connectionId")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "listExecutions", null);
exports.AlertsController = AlertsController = __decorate([
    (0, common_1.Controller)("alerts"),
    __metadata("design:paramtypes", [create_alert_rule_use_case_1.CreateAlertRuleUseCase,
        get_alert_rule_use_case_1.GetAlertRuleUseCase,
        list_alert_rules_use_case_1.ListAlertRulesUseCase,
        update_alert_rule_use_case_1.UpdateAlertRuleUseCase,
        enable_alert_rule_use_case_1.EnableAlertRuleUseCase,
        disable_alert_rule_use_case_1.DisableAlertRuleUseCase,
        delete_alert_rule_use_case_1.DeleteAlertRuleUseCase,
        get_alert_execution_use_case_1.GetAlertExecutionUseCase,
        list_alert_executions_use_case_1.ListAlertExecutionsUseCase])
], AlertsController);
//# sourceMappingURL=alerts.controller.js.map