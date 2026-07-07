import { AlertMetric } from "../../../../domain/enums/alert-metric.enum";
import { AlertOperator } from "../../../../domain/enums/alert-operator.enum";
import { NotificationChannel } from "../../../../domain/enums/notification-channel.enum";

export type GetAlertRuleResponseDTO = {
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
