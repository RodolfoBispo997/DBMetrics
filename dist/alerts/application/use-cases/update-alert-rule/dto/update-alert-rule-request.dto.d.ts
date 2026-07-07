import { AlertMetric } from "../../../../domain/enums/alert-metric.enum";
import { AlertOperator } from "../../../../domain/enums/alert-operator.enum";
import { NotificationChannel } from "../../../../domain/enums/notification-channel.enum";
export type UpdateAlertRuleRequestDTO = {
    userId: string;
    alertRuleId: string;
    metric: AlertMetric;
    operator: AlertOperator;
    threshold: number;
    channel: NotificationChannel;
};
