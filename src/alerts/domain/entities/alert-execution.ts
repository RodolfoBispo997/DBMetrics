import { randomUUID } from "node:crypto";

import { DomainError } from "../../../user/domain/errors/domain-error";

import { AlertExecutionStatus } from "../enums/alert-execution-status.enum";
import { AlertMetric } from "../enums/alert-metric.enum";
import { AlertOperator } from "../enums/alert-operator.enum";
import { NotificationChannel } from "../enums/notification-channel.enum";

import { InvalidAlertExecutionStatusError } from "../errors/invalid-alert-execution-status-error";
import { InvalidAlertMetricError } from "../errors/invalid-alert-metric-error";
import { InvalidAlertOperatorError } from "../errors/invalid-alert-operator-error";
import { InvalidAlertRuleIdError } from "../errors/invalid-alert-rule-id-error";
import { InvalidDatabaseConnectionsIdError } from "../errors/invalid-database-connections-id-error";
import { InvalidDatabaseMetricIdError } from "../errors/invalid-database-metric-id-error";
import { InvalidErrorMessageError } from "../errors/invalid-error-message-error";
import { InvalidMetricValueError } from "../errors/invalid-metric-value-error";
import { InvalidNotificationChannelError } from "../errors/invalid-notification-channel-error";

import { AlertExecutionProps } from "../types/alert-execution-props.type";
import { CreateAlertExecutionProps } from "../types/create-alert-execution-props.type";
import { InvalidThresholdError } from "../errors/invalid-threshold-error";
import { InvalidConnectionNameError } from "../errors/invalid-connection-name-error";
import { InvalidHostError } from "../errors/invalid-host-error";
import { InvalidDatabaseNameError } from "../errors/invalid-database-name-error";
import { InvalidPortError } from "../errors/invalid-port-error";

export class AlertExecution {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private constructor(private readonly props: AlertExecutionProps) {}

  public static create(props: CreateAlertExecutionProps): AlertExecution {
    return new AlertExecution({
      id: randomUUID(),

      alertRuleId: this.validateUuid(
        props.alertRuleId,
        InvalidAlertRuleIdError,
        "Alert rule id",
      ),

      databaseMetricId: this.validateUuid(
        props.databaseMetricId,
        InvalidDatabaseMetricIdError,
        "Database metric id",
      ),

      databaseConnectionId: this.validateUuid(
        props.databaseConnectionId,
        InvalidDatabaseConnectionsIdError,
        "Database connection id",
      ),
      connectionName: this.validateConnectionName(props.connectionName),
      databaseProvider: props.databaseProvider,
      host: this.validateHost(props.host),
      databaseName: this.validateDatabaseName(props.databaseName),
      port: this.validatePort(props.port),
      metric: this.validateMetric(props.metric),
      operator: this.validateOperator(props.operator),
      metricValue: this.validateMetricValue(props.metricValue),
      threshold: this.validateThreshold(props.threshold),
      channel: this.validateNotificationChannel(props.channel),
      destination: props.destination,
      status: this.validateStatus(props.status ?? AlertExecutionStatus.PENDING),
      errorMessage: this.validateErrorMessage(props.errorMessage),
      triggeredAt: new Date(),
      sentAt: undefined,
    });
  }

  public static restore(props: AlertExecutionProps): AlertExecution {
    return new AlertExecution(props);
  }

  private static validateUuid<T extends DomainError>(
    value: string,
    ErrorType: new (reason: string) => T,
    field: string,
  ): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new ErrorType(`${field} cannot be empty`);
    }

    if (!this.UUID_REGEX.test(normalized)) {
      throw new ErrorType(`${field} is invalid`);
    }

    return normalized;
  }

  private static readonly ALERT_METRICS = new Set(Object.values(AlertMetric));

  private static validateMetric(metric: AlertMetric): AlertMetric {
    if (!this.ALERT_METRICS.has(metric)) {
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

  private static validateNotificationChannel(
    channel: NotificationChannel,
  ): NotificationChannel {
    if (!Object.values(NotificationChannel).includes(channel)) {
      throw new InvalidNotificationChannelError("Invalid notification channel");
    }

    return channel;
  }

  private static validateStatus(
    status: AlertExecutionStatus,
  ): AlertExecutionStatus {
    if (!Object.values(AlertExecutionStatus).includes(status)) {
      throw new InvalidAlertExecutionStatusError(
        "Invalid alert execution status",
      );
    }

    return status;
  }

  private static validateMetricValue(value: number): number {
    if (!Number.isFinite(value)) {
      throw new InvalidMetricValueError("Metric value must be a valid number");
    }

    if (value < 0) {
      throw new InvalidMetricValueError("Metric value cannot be negative");
    }

    return value;
  }

  private static validateThreshold(value: number): number {
    if (!Number.isFinite(value)) {
      throw new InvalidThresholdError("Threshold must be a valid number");
    }

    if (value < 0) {
      throw new InvalidThresholdError("Threshold cannot be negative");
    }

    return value;
  }

  private static validateErrorMessage(
    message?: string | null,
  ): string | undefined {
    if (message == null) {
      return undefined;
    }

    const normalized = message.trim().replace(/\s+/g, " ");

    if (!normalized) {
      throw new InvalidErrorMessageError("Error message cannot be empty");
    }

    if (normalized.length > 1000) {
      throw new InvalidErrorMessageError("Error message is too long");
    }

    return normalized;
  }

  private static validateConnectionName(name: string): string {
    const normalized = name.trim().replace(/\s+/g, " ");

    if (!normalized) {
      throw new InvalidConnectionNameError("Connection name cannot be empty");
    }

    return normalized;
  }

  private static validateHost(host: string): string {
    const normalized = host.trim().replace(/\s+/g, " ");

    if (!normalized) {
      throw new InvalidHostError("Host cannot be empty");
    }

    return normalized;
  }

  private static validateDatabaseName(name: string): string {
    const normalized = name.trim().replace(/\s+/g, " ");

    if (!normalized) {
      throw new InvalidDatabaseNameError("Database name cannot be empty");
    }

    return normalized;
  }

  private static validatePort(port: number): number {
    if (!Number.isInteger(port)) {
      throw new InvalidPortError("Port must be an integer");
    }

    if (port <= 0 || port > 65535) {
      throw new InvalidPortError("Invalid port");
    }

    return port;
  }

  public markAsSent(): void {
    if (this.props.status === AlertExecutionStatus.SENT) {
      return;
    }

    this.props.status = AlertExecutionStatus.SENT;
    this.props.sentAt = new Date();
    this.props.errorMessage = undefined;
  }

  public markAsFailed(errorMessage: string): void {
    this.props.status = AlertExecutionStatus.FAILED;
    this.props.errorMessage = AlertExecution.validateErrorMessage(errorMessage);
  }

  public markAsPending(): void {
    if (this.props.status === AlertExecutionStatus.PENDING) {
      return;
    }

    this.props.status = AlertExecutionStatus.PENDING;
    this.props.errorMessage = undefined;
    this.props.sentAt = undefined;
  }

  get id() {
    return this.props.id;
  }

  get alertRuleId() {
    return this.props.alertRuleId;
  }

  get databaseMetricId() {
    return this.props.databaseMetricId;
  }

  get databaseConnectionId() {
    return this.props.databaseConnectionId;
  }

  get metric() {
    return this.props.metric;
  }

  get operator() {
    return this.props.operator;
  }

  get metricValue() {
    return this.props.metricValue;
  }

  get threshold() {
    return this.props.threshold;
  }

  get channel() {
    return this.props.channel;
  }

  get status() {
    return this.props.status;
  }

  get errorMessage() {
    return this.props.errorMessage;
  }

  get triggeredAt() {
    return this.props.triggeredAt;
  }

  get sentAt() {
    return this.props.sentAt;
  }

  get connectionName() {
    return this.props.connectionName;
  }

  get databaseProvider() {
    return this.props.databaseProvider;
  }

  get host() {
    return this.props.host;
  }

  get databaseName() {
    return this.props.databaseName;
  }

  get port() {
    return this.props.port;
  }

  get destination(): string {
    return this.props.destination;
  }
}
