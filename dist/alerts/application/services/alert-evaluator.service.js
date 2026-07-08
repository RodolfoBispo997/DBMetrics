"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertEvaluatorService = void 0;
const common_1 = require("@nestjs/common");
const alert_metric_enum_1 = require("../../domain/enums/alert-metric.enum");
const alert_operator_enum_1 = require("../../domain/enums/alert-operator.enum");
let AlertEvaluatorService = class AlertEvaluatorService {
    constructor() {
        this.metricMap = {
            [alert_metric_enum_1.AlertMetric.DATABASE_SIZE]: (m) => m.databaseSize,
            [alert_metric_enum_1.AlertMetric.ACTIVE_CONNECTIONS]: (m) => m.activeConnections,
            [alert_metric_enum_1.AlertMetric.TABLES_COUNT]: (m) => m.tablesCount,
            [alert_metric_enum_1.AlertMetric.VIEWS_COUNT]: (m) => m.viewsCount,
            [alert_metric_enum_1.AlertMetric.SCHEMAS_COUNT]: (m) => m.schemasCount,
            [alert_metric_enum_1.AlertMetric.INDEXES_COUNT]: (m) => m.indexesCount,
            [alert_metric_enum_1.AlertMetric.FUNCTIONS_COUNT]: (m) => m.functionsCount,
        };
    }
    evaluate(rule, metrics) {
        const value = this.metricMap[rule.metric](metrics);
        switch (rule.operator) {
            case alert_operator_enum_1.AlertOperator.GREATER_THAN:
                return value > rule.threshold;
            case alert_operator_enum_1.AlertOperator.GREATER_THAN_OR_EQUAL:
                return value >= rule.threshold;
            case alert_operator_enum_1.AlertOperator.LESS_THAN:
                return value < rule.threshold;
            case alert_operator_enum_1.AlertOperator.LESS_THAN_OR_EQUAL:
                return value <= rule.threshold;
            case alert_operator_enum_1.AlertOperator.EQUAL:
                return value === rule.threshold;
            case alert_operator_enum_1.AlertOperator.NOT_EQUAL:
                return value !== rule.threshold;
        }
    }
    getMetricValue(metric, metrics) {
        return this.metricMap[metric](metrics);
    }
};
exports.AlertEvaluatorService = AlertEvaluatorService;
exports.AlertEvaluatorService = AlertEvaluatorService = __decorate([
    (0, common_1.Injectable)()
], AlertEvaluatorService);
//# sourceMappingURL=alert-evaluator.service.js.map