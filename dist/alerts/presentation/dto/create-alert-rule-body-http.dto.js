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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAlertRuleBodyHttpDTO = void 0;
const class_validator_1 = require("class-validator");
const alert_metric_enum_1 = require("../../domain/enums/alert-metric.enum");
const alert_operator_enum_1 = require("../../domain/enums/alert-operator.enum");
const notification_channel_enum_1 = require("../../domain/enums/notification-channel.enum");
class CreateAlertRuleBodyHttpDTO {
}
exports.CreateAlertRuleBodyHttpDTO = CreateAlertRuleBodyHttpDTO;
__decorate([
    (0, class_validator_1.IsEnum)(alert_metric_enum_1.AlertMetric),
    __metadata("design:type", String)
], CreateAlertRuleBodyHttpDTO.prototype, "metric", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(alert_operator_enum_1.AlertOperator),
    __metadata("design:type", String)
], CreateAlertRuleBodyHttpDTO.prototype, "operator", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAlertRuleBodyHttpDTO.prototype, "threshold", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(notification_channel_enum_1.NotificationChannel),
    __metadata("design:type", String)
], CreateAlertRuleBodyHttpDTO.prototype, "channel", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAlertRuleBodyHttpDTO.prototype, "connectionId", void 0);
//# sourceMappingURL=create-alert-rule-body-http.dto.js.map