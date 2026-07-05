import { DatabaseHealthService } from "../../../application/services/database-health/database-health-service";
import { DatabaseHealth } from "../../../application/types/database-health.type";
import { DatabaseMetricData } from "../../../application/types/database-metric-data.type";
export declare class DatabaseHealthServiceImpl implements DatabaseHealthService {
    evaluate(metrics: DatabaseMetricData): DatabaseHealth;
}
