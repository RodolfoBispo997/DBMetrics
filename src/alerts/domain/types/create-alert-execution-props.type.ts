import { AlertMetric } from "../enums/alert-metric.enum";
import { AlertOperator } from "../enums/alert-operator.enum";
import { AlertExecutionStatus } from "../enums/alert-execution-status.enum";
import { NotificationChannel } from "../enums/notification-channel.enum";

export type CreateAlertExecutionProps = {
  alertRuleId: string;
  databaseMetricId: string;
  databaseConnectionId: string;

  metric: AlertMetric;
  operator: AlertOperator;

  metricValue: number;
  threshold: number;

  channel: NotificationChannel;

  status?: AlertExecutionStatus;

  errorMessage?: string;
};
