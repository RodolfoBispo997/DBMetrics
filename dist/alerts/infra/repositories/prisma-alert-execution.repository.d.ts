import { AlertExecutionRepository } from "../../application/repositories/alert-execution-repository";
import { AlertExecution } from "../../domain/entities/alert-execution";
export declare class PrismaAlertExecutionRepository implements AlertExecutionRepository {
    save(alertExecution: AlertExecution): Promise<void>;
    update(alertExecution: AlertExecution): Promise<void>;
    findById(id: string): Promise<AlertExecution | null>;
    findManyByConnectionId(connectionId: string): Promise<AlertExecution[]>;
    findRecent(limit: number): Promise<AlertExecution[]>;
}
