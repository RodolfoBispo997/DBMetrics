"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertRule = void 0;
const crypto_1 = require("crypto");
const invalid_destination_error_1 = require("../errors/invalid-destination-error");
class AlertRule {
    constructor(props) {
        this.props = props;
    }
    static create(data) {
        return new AlertRule({
            id: (0, crypto_1.randomUUID)(),
            metric: data.metric,
            operator: data.operator,
            threshold: data.threshold,
            channel: data.channel,
            destination: AlertRule.validateDestination(data.destination),
            enabled: true,
            databaseConnectionId: data.databaseConnectionId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    static restore(props) {
        return new AlertRule(props);
    }
    update(data) {
        this.props.metric = data.metric;
        this.props.operator = data.operator;
        this.props.threshold = data.threshold;
        this.props.channel = data.channel;
        this.props.destination = AlertRule.validateDestination(data.destination);
        this.props.updatedAt = new Date();
    }
    enable() {
        this.props.enabled = true;
        this.props.updatedAt = new Date();
    }
    disable() {
        this.props.enabled = false;
        this.props.updatedAt = new Date();
    }
    static validateDestination(destination) {
        const normalized = destination.trim();
        if (!normalized) {
            throw new invalid_destination_error_1.InvalidDestinationError("Destination cannot be empty");
        }
        if (!this.PHONE_REGEX.test(normalized)) {
            throw new invalid_destination_error_1.InvalidDestinationError("Destination must be in E.164 format without '+' (e.g. 5511999999999)");
        }
        return normalized;
    }
    get id() {
        return this.props.id;
    }
    get metric() {
        return this.props.metric;
    }
    get operator() {
        return this.props.operator;
    }
    get threshold() {
        return this.props.threshold;
    }
    get channel() {
        return this.props.channel;
    }
    get enabled() {
        return this.props.enabled;
    }
    get databaseConnectionId() {
        return this.props.databaseConnectionId;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    get destination() {
        return this.props.destination;
    }
}
exports.AlertRule = AlertRule;
AlertRule.PHONE_REGEX = /^55\d{10,13}$/;
//# sourceMappingURL=alert-rule.js.map