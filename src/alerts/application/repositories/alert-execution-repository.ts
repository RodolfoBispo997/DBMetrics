import { AlertExecution } from "../../domain/entities/alert-execution";

export interface FindAlertExecutionsByConnectionIdResult {
  executions: AlertExecution[];
  total: number;
}

export interface AlertExecutionRepository {
  save(alertExecution: AlertExecution): Promise<void>;
  update(alertExecution: AlertExecution): Promise<void>;
  findById(id: string): Promise<AlertExecution | null>;
  findManyByConnectionId(data: {
    connectionId: string;
    skip: number;
    take: number;
  }): Promise<FindAlertExecutionsByConnectionIdResult>;
  findRecent(limit: number): Promise<AlertExecution[]>;
}
