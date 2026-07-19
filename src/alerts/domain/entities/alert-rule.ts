import { randomUUID } from "crypto";

import { AlertMetric } from "../enums/alert-metric.enum";
import { AlertOperator } from "../enums/alert-operator.enum";
import { NotificationChannel } from "../enums/notification-channel.enum";

import { AlertRuleProps } from "../types/alert-rule-props.type";
import { CreateAlertRuleProps } from "../types/create-alert-rule-props.type";
import { UpdateAlertRuleProps } from "../types/update-alert-rule-props.type";
import { InvalidDestinationError } from "../errors/invalid-destination-error";
import { InvalidAlertMetricError } from "../errors/invalid-alert-metric-error";
import { InvalidAlertOperatorError } from "../errors/invalid-alert-operator-error";
import { InvalidNotificationChannelError } from "../errors/invalid-notification-channel-error";
import { InvalidThresholdError } from "../errors/invalid-threshold-error";

export class AlertRule {
  private props: AlertRuleProps;

  private constructor(props: AlertRuleProps) {
    this.props = props;
  }

  static create(data: CreateAlertRuleProps): AlertRule {
    return new AlertRule({
      id: randomUUID(),

      metric: AlertRule.validateMetric(data.metric),
      operator: AlertRule.validateOperator(data.operator),
      threshold: AlertRule.validateThreshold(data.threshold),
      channel: AlertRule.validateChannel(data.channel),
      destination: AlertRule.validateDestination(data.destination),
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
    this.props.metric = AlertRule.validateMetric(data.metric);
    this.props.operator = AlertRule.validateOperator(data.operator);
    this.props.threshold = AlertRule.validateThreshold(data.threshold);
    this.props.channel = AlertRule.validateChannel(data.channel);
    this.props.destination = AlertRule.validateDestination(data.destination);
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

  private static readonly PHONE_REGEX = /^55\d{10,11}$/;

  private static validateMetric(metric: AlertMetric): AlertMetric {
    if (!Object.values(AlertMetric).includes(metric)) {
      throw new InvalidAlertMetricError("Invalid alert metric");
    }

    return metric;
  }

  private static validateOperator(operator: AlertOperator): AlertOperator {
    if (!Object.values(AlertOperator).includes(operator)) {
      throw new InvalidAlertOperatorError("Invalid alert operator");
    }

    return operator;
  }

  private static validateChannel(
    channel: NotificationChannel,
  ): NotificationChannel {
    if (channel !== NotificationChannel.WHATSAPP) {
      throw new InvalidNotificationChannelError(
        "Only WhatsApp notifications are supported",
      );
    }

    return channel;
  }

  private static validateThreshold(threshold: number): number {
    if (!Number.isFinite(threshold)) {
      throw new InvalidThresholdError("Threshold must be a valid number");
    }

    if (threshold < 0) {
      throw new InvalidThresholdError("Threshold cannot be negative");
    }

    return threshold;
  }

  private static validateDestination(destination: string): string {
    const normalized = destination.trim();

    if (!normalized) {
      throw new InvalidDestinationError("Destination cannot be empty");
    }

    if (!this.PHONE_REGEX.test(normalized)) {
      throw new InvalidDestinationError(
        "Destination must be in E.164 format without '+' (e.g. 5511999999999)",
      );
    }

    return normalized;
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

  get destination(): string {
    return this.props.destination;
  }
}
