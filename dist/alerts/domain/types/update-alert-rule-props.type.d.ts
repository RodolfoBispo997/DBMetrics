import { AlertMetric } from "../enums/alert-metric.enum";
import { AlertOperator } from "../enums/alert-operator.enum";
import { NotificationChannel } from "../enums/notification-channel.enum";
export type UpdateAlertRuleProps = {
    metric: AlertMetric;
    operator: AlertOperator;
    threshold: number;
    channel: NotificationChannel;
};
