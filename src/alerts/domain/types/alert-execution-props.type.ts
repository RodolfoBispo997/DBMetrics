import { AlertMetric } from "../enums/alert-metric.enum";
import { AlertOperator } from "../enums/alert-operator.enum";
import { AlertExecutionStatus } from "../enums/alert-execution-status.enum";
import { NotificationChannel } from "../enums/notification-channel.enum";
import { DatabaseProvider } from "../../../database-connection/domain/enums/database-provider.enum";

export type AlertExecutionProps = {
  id: string;
  alertRuleId: string;
  databaseMetricId: string;
  databaseConnectionId: string;
  connectionName: string;
  databaseProvider: DatabaseProvider;
  host: string;
  databaseName: string;
  port: number;
  metric: AlertMetric;
  operator: AlertOperator;
  metricValue: number;
  threshold: number;
  channel: NotificationChannel;
  destination: string;
  status: AlertExecutionStatus;
  errorMessage?: string;
  triggeredAt: Date;
  sentAt?: Date;
};
