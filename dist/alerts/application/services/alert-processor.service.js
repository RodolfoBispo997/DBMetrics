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
exports.AlertProcessorService = void 0;
const common_1 = require("@nestjs/common");
const alert_evaluator_service_1 = require("./alert-evaluator.service");
let AlertProcessorService = class AlertProcessorService {
    constructor(alertRuleRepository, alertEvaluator) {
        this.alertRuleRepository = alertRuleRepository;
        this.alertEvaluator = alertEvaluator;
    }
    async process(metrics) {
        const rules = await this.alertRuleRepository.findManyByConnectionId(metrics.databaseConnectionId);
        const enabledRules = rules.filter((rule) => rule.enabled);
        for (const rule of enabledRules) {
            const matched = this.alertEvaluator.evaluate(rule, metrics);
            if (!matched) {
                continue;
            }
            console.log(`[ALERT] ${rule.metric} excedeu o limite (${rule.threshold})`);
        }
    }
};
exports.AlertProcessorService = AlertProcessorService;
exports.AlertProcessorService = AlertProcessorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("AlertRuleRepository")),
    __metadata("design:paramtypes", [Object, alert_evaluator_service_1.AlertEvaluatorService])
], AlertProcessorService);
//# sourceMappingURL=alert-processor.service.js.map