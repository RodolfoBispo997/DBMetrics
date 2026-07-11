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
var AlertProcessorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertProcessorService = void 0;
const common_1 = require("@nestjs/common");
const alert_evaluator_service_1 = require("./alert-evaluator.service");
const create_alert_execution_use_case_1 = require("../use-cases/create-alert-execution/create-alert-execution.use-case");
let AlertProcessorService = AlertProcessorService_1 = class AlertProcessorService {
    constructor(alertRuleRepository, alertExecutionRepository, databaseConnectionRepository, alertEvaluator, createAlertExecutionUseCase, notificationFactory) {
        this.alertRuleRepository = alertRuleRepository;
        this.alertExecutionRepository = alertExecutionRepository;
        this.databaseConnectionRepository = databaseConnectionRepository;
        this.alertEvaluator = alertEvaluator;
        this.createAlertExecutionUseCase = createAlertExecutionUseCase;
        this.notificationFactory = notificationFactory;
        this.logger = new common_1.Logger(AlertProcessorService_1.name);
    }
    async process(metrics) {
        const rules = await this.alertRuleRepository.findManyByConnectionId(metrics.databaseConnectionId);
        const connection = await this.databaseConnectionRepository.findById(metrics.databaseConnectionId);
        if (!connection) {
            this.logger.error(`Database connection ${metrics.databaseConnectionId} not found.`);
            return;
        }
        const enabledRules = rules.filter((rule) => rule.enabled);
        for (const rule of enabledRules) {
            const matched = this.alertEvaluator.evaluate(rule, metrics);
            if (!matched) {
                continue;
            }
            const execution = await this.createAlertExecutionUseCase.execute(rule, metrics, connection);
            this.logger.warn(`[${execution.status}] ${rule.metric} exceeded the threshold (${rule.threshold})`);
            const notification = this.notificationFactory.get(execution.channel);
            try {
                this.logger.log(`Sending WhatsApp notification to ${execution.destination}`);
                await notification.send(execution);
                this.logger.log(`WhatsApp notification sent to ${execution.destination}`);
                execution.markAsSent();
                await this.alertExecutionRepository.update(execution);
            }
            catch (error) {
                execution.markAsFailed(error instanceof Error ? error.message : "Unknown error");
                await this.alertExecutionRepository.update(execution);
                this.logger.error(`Failed to send notification for execution ${execution.id}`, error instanceof Error ? error.stack : undefined);
            }
        }
    }
};
exports.AlertProcessorService = AlertProcessorService;
exports.AlertProcessorService = AlertProcessorService = AlertProcessorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("AlertRuleRepository")),
    __param(1, (0, common_1.Inject)("AlertExecutionRepository")),
    __param(2, (0, common_1.Inject)("DatabaseConnectionRepository")),
    __param(5, (0, common_1.Inject)("NotificationFactory")),
    __metadata("design:paramtypes", [Object, Object, Object, alert_evaluator_service_1.AlertEvaluatorService,
        create_alert_execution_use_case_1.CreateAlertExecutionUseCase, Object])
], AlertProcessorService);
//# sourceMappingURL=alert-processor.service.js.map