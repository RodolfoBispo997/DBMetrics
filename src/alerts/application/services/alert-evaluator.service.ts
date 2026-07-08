import { Injectable } from "@nestjs/common";

import { AlertRule } from "../../domain/entities/alert-rule";
import { AlertMetric } from "../../domain/enums/alert-metric.enum";
import { AlertOperator } from "../../domain/enums/alert-operator.enum";

import { DatabaseMetrics } from "../../../database-metric/domain/entities/database-metric";

@Injectable()
export class AlertEvaluatorService {
  private readonly metricMap = {
    [AlertMetric.DATABASE_SIZE]: (m: DatabaseMetrics) => m.databaseSize,

    [AlertMetric.ACTIVE_CONNECTIONS]: (m: DatabaseMetrics) =>
      m.activeConnections,

    [AlertMetric.TABLES_COUNT]: (m: DatabaseMetrics) => m.tablesCount,

    [AlertMetric.VIEWS_COUNT]: (m: DatabaseMetrics) => m.viewsCount,

    [AlertMetric.SCHEMAS_COUNT]: (m: DatabaseMetrics) => m.schemasCount,

    [AlertMetric.INDEXES_COUNT]: (m: DatabaseMetrics) => m.indexesCount,

    [AlertMetric.FUNCTIONS_COUNT]: (m: DatabaseMetrics) => m.functionsCount,
  };

  evaluate(rule: AlertRule, metrics: DatabaseMetrics): boolean {
    const value = this.metricMap[rule.metric](metrics);

    switch (rule.operator) {
      case AlertOperator.GREATER_THAN:
        return value > rule.threshold;

      case AlertOperator.GREATER_THAN_OR_EQUAL:
        return value >= rule.threshold;

      case AlertOperator.LESS_THAN:
        return value < rule.threshold;

      case AlertOperator.LESS_THAN_OR_EQUAL:
        return value <= rule.threshold;

      case AlertOperator.EQUAL:
        return value === rule.threshold;

      case AlertOperator.NOT_EQUAL:
        return value !== rule.threshold;
    }
  }
}
