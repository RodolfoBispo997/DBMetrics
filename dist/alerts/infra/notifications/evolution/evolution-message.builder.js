"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionMessageBuilder = void 0;
class EvolutionMessageBuilder {
    static build(execution) {
        return `
🚨 DBMetrics Alert

Connection: ${execution.connectionName}

Metric: ${execution.metric}

Value: ${execution.metricValue}

Threshold: ${execution.threshold}
`;
    }
}
exports.EvolutionMessageBuilder = EvolutionMessageBuilder;
//# sourceMappingURL=evolution-message.builder.js.map