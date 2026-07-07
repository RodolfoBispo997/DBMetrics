"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertRule = void 0;
const crypto_1 = require("crypto");
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
}
exports.AlertRule = AlertRule;
//# sourceMappingURL=alert-rule.js.map