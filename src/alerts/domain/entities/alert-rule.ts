import { randomUUID } from "crypto";

import { AlertMetric } from "../enums/alert-metric.enum";
import { AlertOperator } from "../enums/alert-operator.enum";
import { NotificationChannel } from "../enums/notification-channel.enum";

import { AlertRuleProps } from "../types/alert-rule-props.type";
import { CreateAlertRuleProps } from "../types/create-alert-rule-props.type";
import { UpdateAlertRuleProps } from "../types/update-alert-rule-props.type";

export class AlertRule {
  private props: AlertRuleProps;

  private constructor(props: AlertRuleProps) {
    this.props = props;
  }

  static create(data: CreateAlertRuleProps): AlertRule {
    return new AlertRule({
      id: randomUUID(),

      metric: data.metric,
      operator: data.operator,
      threshold: data.threshold,
      channel: data.channel,

      enabled: true,

      databaseConnectionId: data.databaseConnectionId,

      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: AlertRuleProps): AlertRule {
    return new AlertRule(props);
  }

  update(data: UpdateAlertRuleProps): void {
    this.props.metric = data.metric;
    this.props.operator = data.operator;
    this.props.threshold = data.threshold;
    this.props.channel = data.channel;

    this.props.updatedAt = new Date();
  }

  enable(): void {
    this.props.enabled = true;
    this.props.updatedAt = new Date();
  }

  disable(): void {
    this.props.enabled = false;
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }

  get metric(): AlertMetric {
    return this.props.metric;
  }

  get operator(): AlertOperator {
    return this.props.operator;
  }

  get threshold(): number {
    return this.props.threshold;
  }

  get channel(): NotificationChannel {
    return this.props.channel;
  }

  get enabled(): boolean {
    return this.props.enabled;
  }

  get databaseConnectionId(): string {
    return this.props.databaseConnectionId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
