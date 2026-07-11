import { AlertMetric } from "../../domain/enums/alert-metric.enum";
import { AlertOperator } from "../../domain/enums/alert-operator.enum";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";
export declare class UpdateAlertRuleBodyHttpDTO {
    metric: AlertMetric;
    operator: AlertOperator;
    threshold: number;
    channel: NotificationChannel;
    destination: string;
}
