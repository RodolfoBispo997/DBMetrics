"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertExecution = void 0;
const node_crypto_1 = require("node:crypto");
const alert_execution_status_enum_1 = require("../enums/alert-execution-status.enum");
const alert_metric_enum_1 = require("../enums/alert-metric.enum");
const alert_operator_enum_1 = require("../enums/alert-operator.enum");
const notification_channel_enum_1 = require("../enums/notification-channel.enum");
const invalid_alert_execution_status_error_1 = require("../errors/invalid-alert-execution-status-error");
const invalid_alert_metric_error_1 = require("../errors/invalid-alert-metric-error");
const invalid_alert_operator_error_1 = require("../errors/invalid-alert-operator-error");
const invalid_alert_rule_id_error_1 = require("../errors/invalid-alert-rule-id-error");
const invalid_database_connections_id_error_1 = require("../errors/invalid-database-connections-id-error");
const invalid_database_metric_id_error_1 = require("../errors/invalid-database-metric-id-error");
const invalid_error_message_error_1 = require("../errors/invalid-error-message-error");
const invalid_metric_value_error_1 = require("../errors/invalid-metric-value-error");
const invalid_notification_channel_error_1 = require("../errors/invalid-notification-channel-error");
const invalid_threshold_error_1 = require("../errors/invalid-threshold-error");
const invalid_connection_name_error_1 = require("../errors/invalid-connection-name-error");
const invalid_host_error_1 = require("../errors/invalid-host-error");
const invalid_database_name_error_1 = require("../errors/invalid-database-name-error");
const invalid_port_error_1 = require("../errors/invalid-port-error");
class AlertExecution {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new AlertExecution({
            id: (0, node_crypto_1.randomUUID)(),
            alertRuleId: this.validateUuid(props.alertRuleId, invalid_alert_rule_id_error_1.InvalidAlertRuleIdError, "Alert rule id"),
            databaseMetricId: this.validateUuid(props.databaseMetricId, invalid_database_metric_id_error_1.InvalidDatabaseMetricIdError, "Database metric id"),
            databaseConnectionId: this.validateUuid(props.databaseConnectionId, invalid_database_connections_id_error_1.InvalidDatabaseConnectionsIdError, "Database connection id"),
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
            status: this.validateStatus(props.status ?? alert_execution_status_enum_1.AlertExecutionStatus.PENDING),
            errorMessage: this.validateErrorMessage(props.errorMessage),
            triggeredAt: new Date(),
            sentAt: undefined,
        });
    }
    static restore(props) {
        return new AlertExecution(props);
    }
    static validateUuid(value, ErrorType, field) {
        const normalized = value.trim();
        if (!normalized) {
            throw new ErrorType(`${field} cannot be empty`);
        }
        if (!this.UUID_REGEX.test(normalized)) {
            throw new ErrorType(`${field} is invalid`);
        }
        return normalized;
    }
    static validateMetric(metric) {
        if (!this.ALERT_METRICS.has(metric)) {
            throw new invalid_alert_metric_error_1.InvalidAlertMetricError("Invalid alert metric");
        }
        return metric;
    }
    static validateOperator(operator) {
        if (!Object.values(alert_operator_enum_1.AlertOperator).includes(operator)) {
            throw new invalid_alert_operator_error_1.InvalidAlertOperatorError("Invalid alert operator");
        }
        return operator;
    }
    static validateNotificationChannel(channel) {
        if (!Object.values(notification_channel_enum_1.NotificationChannel).includes(channel)) {
            throw new invalid_notification_channel_error_1.InvalidNotificationChannelError("Invalid notification channel");
        }
        return channel;
    }
    static validateStatus(status) {
        if (!Object.values(alert_execution_status_enum_1.AlertExecutionStatus).includes(status)) {
            throw new invalid_alert_execution_status_error_1.InvalidAlertExecutionStatusError("Invalid alert execution status");
        }
        return status;
    }
    static validateMetricValue(value) {
        if (!Number.isFinite(value)) {
            throw new invalid_metric_value_error_1.InvalidMetricValueError("Metric value must be a valid number");
        }
        if (value < 0) {
            throw new invalid_metric_value_error_1.InvalidMetricValueError("Metric value cannot be negative");
        }
        return value;
    }
    static validateThreshold(value) {
        if (!Number.isFinite(value)) {
            throw new invalid_threshold_error_1.InvalidThresholdError("Threshold must be a valid number");
        }
        if (value < 0) {
            throw new invalid_threshold_error_1.InvalidThresholdError("Threshold cannot be negative");
        }
        return value;
    }
    static validateErrorMessage(message) {
        if (message == null) {
            return undefined;
        }
        const normalized = message.trim().replace(/\s+/g, " ");
        if (!normalized) {
            throw new invalid_error_message_error_1.InvalidErrorMessageError("Error message cannot be empty");
        }
        if (normalized.length > 1000) {
            throw new invalid_error_message_error_1.InvalidErrorMessageError("Error message is too long");
        }
        return normalized;
    }
    static validateConnectionName(name) {
        const normalized = name.trim().replace(/\s+/g, " ");
        if (!normalized) {
            throw new invalid_connection_name_error_1.InvalidConnectionNameError("Connection name cannot be empty");
        }
        return normalized;
    }
    static validateHost(host) {
        const normalized = host.trim().replace(/\s+/g, " ");
        if (!normalized) {
            throw new invalid_host_error_1.InvalidHostError("Host cannot be empty");
        }
        return normalized;
    }
    static validateDatabaseName(name) {
        const normalized = name.trim().replace(/\s+/g, " ");
        if (!normalized) {
            throw new invalid_database_name_error_1.InvalidDatabaseNameError("Database name cannot be empty");
        }
        return normalized;
    }
    static validatePort(port) {
        if (!Number.isInteger(port)) {
            throw new invalid_port_error_1.InvalidPortError("Port must be an integer");
        }
        if (port <= 0 || port > 65535) {
            throw new invalid_port_error_1.InvalidPortError("Invalid port");
        }
        return port;
    }
    markAsSent() {
        if (this.props.status === alert_execution_status_enum_1.AlertExecutionStatus.SENT) {
            return;
        }
        this.props.status = alert_execution_status_enum_1.AlertExecutionStatus.SENT;
        this.props.sentAt = new Date();
        this.props.errorMessage = undefined;
    }
    markAsFailed(errorMessage) {
        this.props.status = alert_execution_status_enum_1.AlertExecutionStatus.FAILED;
        this.props.errorMessage = AlertExecution.validateErrorMessage(errorMessage);
    }
    markAsPending() {
        if (this.props.status === alert_execution_status_enum_1.AlertExecutionStatus.PENDING) {
            return;
        }
        this.props.status = alert_execution_status_enum_1.AlertExecutionStatus.PENDING;
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
    get destination() {
        return this.props.destination;
    }
}
exports.AlertExecution = AlertExecution;
AlertExecution.UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
AlertExecution.ALERT_METRICS = new Set(Object.values(alert_metric_enum_1.AlertMetric));
//# sourceMappingURL=alert-execution.js.map