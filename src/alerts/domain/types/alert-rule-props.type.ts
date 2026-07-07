import { AlertMetric } from "../enums/alert-metric.enum";
import { AlertOperator } from "../enums/alert-operator.enum";
import { NotificationChannel } from "../enums/notification-channel.enum";

export type AlertRuleProps = {
  id: string;

  metric: AlertMetric;
  operator: AlertOperator;
  threshold: number;
  channel: NotificationChannel;

  enabled: boolean;

  databaseConnectionId: string;

  createdAt: Date;
  updatedAt: Date;
};
