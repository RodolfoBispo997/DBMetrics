import { AlertRule } from "../../domain/entities/alert-rule";
import { DatabaseMetrics } from "../../../database-metric/domain/entities/database-metric";
export declare class AlertEvaluatorService {
    private readonly metricMap;
    evaluate(rule: AlertRule, metrics: DatabaseMetrics): boolean;
}
