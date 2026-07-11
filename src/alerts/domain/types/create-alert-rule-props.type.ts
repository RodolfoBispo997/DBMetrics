import { AlertMetric } from "../enums/alert-metric.enum";
import { AlertOperator } from "../enums/alert-operator.enum";
import { NotificationChannel } from "../enums/notification-channel.enum";

export type CreateAlertRuleProps = {
  metric: AlertMetric;
  operator: AlertOperator;
  threshold: number;
  channel: NotificationChannel;
  destination: string;
  databaseConnectionId: string;
};
