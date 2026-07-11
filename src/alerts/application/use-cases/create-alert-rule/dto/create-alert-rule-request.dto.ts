import { AlertMetric } from "../../../../domain/enums/alert-metric.enum";
import { AlertOperator } from "../../../../domain/enums/alert-operator.enum";
import { NotificationChannel } from "../../../../domain/enums/notification-channel.enum";

export type CreateAlertRuleRequestDTO = {
  userId: string;
  connectionId: string;
  metric: AlertMetric;
  operator: AlertOperator;
  threshold: number;
  channel: NotificationChannel;
  destination: string;
};
