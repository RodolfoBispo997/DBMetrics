import { AlertExecution } from "../../domain/entities/alert-execution";
export interface NotificationService {
    send(execution: AlertExecution): Promise<void>;
}
