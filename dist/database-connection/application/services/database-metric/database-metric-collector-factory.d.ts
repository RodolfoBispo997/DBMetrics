import { DatabaseProvider } from "../../../domain/enums/database-provider.enum";
import { DatabaseMetricCollector } from "./database-metric-collector";
export interface DatabaseMetricCollectorFactory {
    get(provider: DatabaseProvider): DatabaseMetricCollector;
}
