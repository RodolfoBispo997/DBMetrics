import { AlertExecution } from "../../domain/entities/alert-execution";
export declare class AlertExecutionPresenter {
    static toHTTP(alertExecution: AlertExecution): {
        id: string;
        alertRuleId: string;
        databaseMetricId: string;
        databaseConnectionId: string;
        metric: import("../../domain/enums/alert-metric.enum").AlertMetric;
        operator: import("../../domain/enums/alert-operator.enum").AlertOperator;
        metricValue: number;
        threshold: number;
        channel: import("../../domain/enums/notification-channel.enum").NotificationChannel;
        status: import("../../domain/enums/alert-execution-status.enum").AlertExecutionStatus;
        errorMessage: string | undefined;
        triggeredAt: Date;
        sentAt: Date | undefined;
    };
}
