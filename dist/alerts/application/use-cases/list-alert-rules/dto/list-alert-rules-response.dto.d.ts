import { AlertMetric } from "../../../../domain/enums/alert-metric.enum";
import { AlertOperator } from "../../../../domain/enums/alert-operator.enum";
import { NotificationChannel } from "../../../../domain/enums/notification-channel.enum";
export type ListAlertRulesResponseDTO = {
    alerts: {
        id: string;
        metric: AlertMetric;
        operator: AlertOperator;
        threshold: number;
        channel: NotificationChannel;
        enabled: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[];
};
