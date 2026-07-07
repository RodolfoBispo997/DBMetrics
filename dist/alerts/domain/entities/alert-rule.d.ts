import { AlertMetric } from "../enums/alert-metric.enum";
import { AlertOperator } from "../enums/alert-operator.enum";
import { NotificationChannel } from "../enums/notification-channel.enum";
import { AlertRuleProps } from "../types/alert-rule-props.type";
import { CreateAlertRuleProps } from "../types/create-alert-rule-props.type";
import { UpdateAlertRuleProps } from "../types/update-alert-rule-props.type";
export declare class AlertRule {
    private props;
    private constructor();
    static create(data: CreateAlertRuleProps): AlertRule;
    static restore(props: AlertRuleProps): AlertRule;
    update(data: UpdateAlertRuleProps): void;
    enable(): void;
    disable(): void;
    get id(): string;
    get metric(): AlertMetric;
    get operator(): AlertOperator;
    get threshold(): number;
    get channel(): NotificationChannel;
    get enabled(): boolean;
    get databaseConnectionId(): string;
    get createdAt(): Date;
    get updatedAt(): Date;
}
