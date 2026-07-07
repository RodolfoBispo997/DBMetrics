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
exports.GetAlertRuleUseCase = void 0;
const common_1 = require("@nestjs/common");
const alert_rule_not_found_error_1 = require("../../../domain/errors/alert-rule-not-found-error");
let GetAlertRuleUseCase = class GetAlertRuleUseCase {
    constructor(alertRuleRepository, databaseConnectionRepository) {
        this.alertRuleRepository = alertRuleRepository;
        this.databaseConnectionRepository = databaseConnectionRepository;
    }
    async execute(data) {
        const alertRule = await this.alertRuleRepository.findById(data.alertRuleId);
        if (!alertRule) {
            throw new alert_rule_not_found_error_1.AlertRuleNotFoundError("Alert rule not found");
        }
        const connection = await this.databaseConnectionRepository.findById(alertRule.databaseConnectionId);
        if (!connection || connection.userId !== data.userId) {
            throw new alert_rule_not_found_error_1.AlertRuleNotFoundError("Alert rule not found");
        }
        return {
            id: alertRule.id,
            metric: alertRule.metric,
            operator: alertRule.operator,
            threshold: alertRule.threshold,
            channel: alertRule.channel,
            enabled: alertRule.enabled,
            databaseConnectionId: alertRule.databaseConnectionId,
            createdAt: alertRule.createdAt,
            updatedAt: alertRule.updatedAt,
        };
    }
};
exports.GetAlertRuleUseCase = GetAlertRuleUseCase;
exports.GetAlertRuleUseCase = GetAlertRuleUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("AlertRuleRepository")),
    __param(1, (0, common_1.Inject)("DatabaseConnectionRepository")),
    __metadata("design:paramtypes", [Object, Object])
], GetAlertRuleUseCase);
//# sourceMappingURL=get-alert-rule.use-case.js.map