import { AlertRuleRepository } from "../../application/repositories/alert-rule-repository";
import { AlertRule } from "../../domain/entities/alert-rule";
export declare class PrismaAlertRuleRepository implements AlertRuleRepository {
    save(alertRule: AlertRule): Promise<void>;
    findById(id: string): Promise<AlertRule | null>;
    findManyByConnectionId(connectionId: string): Promise<AlertRule[]>;
    update(alertRule: AlertRule): Promise<void>;
    delete(id: string): Promise<void>;
}
