import { AlertRule } from "../../domain/entities/alert-rule";
export declare class AlertRulePresenter {
    static toHTTP(alertRule: AlertRule): {
        id: string;
        databaseConnectionId: string;
        metric: import("../../domain/enums/alert-metric.enum").AlertMetric;
        operator: import("../../domain/enums/alert-operator.enum").AlertOperator;
        threshold: number;
        channel: import("../../domain/enums/notification-channel.enum").NotificationChannel;
        enabled: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
}
