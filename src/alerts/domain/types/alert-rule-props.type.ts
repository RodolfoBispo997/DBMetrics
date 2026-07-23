import { AlertMetric } from "../enums/alert-metric.enum";
import { AlertOperator } from "../enums/alert-operator.enum";
import { NotificationChannel } from "../enums/notification-channel.enum";
import { AlertRuleState } from "../enums/alert-rule-state.enum";

export type AlertRuleProps = {
  id: string;

  metric: AlertMetric;
  operator: AlertOperator;
  threshold: number;
  channel: NotificationChannel;
  destination: string;
  enabled: boolean;
  cooldownMinutes: number;
  currentState: AlertRuleState;
  lastNotificationAt?: Date | null;
  databaseConnectionId: string;
  createdAt: Date;
  updatedAt: Date;
};
