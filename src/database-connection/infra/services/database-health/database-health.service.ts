import { Injectable } from "@nestjs/common";
import { DatabaseHealthService } from "../../../application/services/database-health/database-health-service";
import { DatabaseHealth } from "../../../application/types/database-health.type";
import { DatabaseMetricData } from "../../../application/types/database-metric-data.type";

@Injectable()
export class DatabaseHealthServiceImpl implements DatabaseHealthService {
  evaluate(metrics: DatabaseMetricData): DatabaseHealth {
    if (metrics.activeConnections >= 100) {
      return {
        status: "CRITICAL",
        message: "Too many active connections",
        checkedAt: new Date(),
      };
    }

    if (metrics.activeConnections >= 70) {
      return {
        status: "WARNING",
        message: "High number of active connections",
        checkedAt: new Date(),
      };
    }

    return {
      status: "ONLINE",
      message: "Database is healthy",
      checkedAt: new Date(),
    };
  }
}
