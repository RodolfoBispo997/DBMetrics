import { AlertExecution } from "../../../domain/entities/alert-execution";

export class EvolutionMessageBuilder {
  static build(execution: AlertExecution): string {
    return `
🚨 DBMetrics Alert

Connection: ${execution.connectionName}

Metric: ${execution.metric}

Value: ${execution.metricValue}

Threshold: ${execution.threshold}
`;
  }
}
