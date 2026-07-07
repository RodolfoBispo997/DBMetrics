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
exports.ListAlertRulesUseCase = void 0;
const common_1 = require("@nestjs/common");
const database_connection_not_found_error_1 = require("../../../../database-connection/domain/errors/database-connection-not-found-error");
let ListAlertRulesUseCase = class ListAlertRulesUseCase {
    constructor(alertRuleRepository, databaseConnectionRepository) {
        this.alertRuleRepository = alertRuleRepository;
        this.databaseConnectionRepository = databaseConnectionRepository;
    }
    async execute(data) {
        const connection = await this.databaseConnectionRepository.findById(data.connectionId);
        if (!connection || connection.userId !== data.userId) {
            throw new database_connection_not_found_error_1.DatabaseConnectionNotFoundError("Connection not found");
        }
        const alertRules = await this.alertRuleRepository.findManyByConnectionId(connection.id);
        return {
            alerts: alertRules.map((alertRule) => ({
                id: alertRule.id,
                metric: alertRule.metric,
                operator: alertRule.operator,
                threshold: alertRule.threshold,
                channel: alertRule.channel,
                enabled: alertRule.enabled,
                createdAt: alertRule.createdAt,
                updatedAt: alertRule.updatedAt,
            })),
        };
    }
};
exports.ListAlertRulesUseCase = ListAlertRulesUseCase;
exports.ListAlertRulesUseCase = ListAlertRulesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("AlertRuleRepository")),
    __param(1, (0, common_1.Inject)("DatabaseConnectionRepository")),
    __metadata("design:paramtypes", [Object, Object])
], ListAlertRulesUseCase);
//# sourceMappingURL=list-alert-rules.use-case.js.map