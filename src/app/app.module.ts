import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { DatabaseConnectionModule } from "../database-connection/database-connection.module";
import { DatabaseMetricModule } from "../database-metric/database-metric.module";
import { DashboardModule } from "../dashboard/dashboard.module";
import { ScheduleModule } from "@nestjs/schedule";
import { AlertsModule } from "../alerts/alerts.module";
import { PrismaModule } from "../shared/infra/database/prisma/prisma.module";
import { ReadinessService, APP_READINESS_TIMEOUT_MS } from "./readiness.service";
import { getAppReadinessTimeoutMs } from "../shared/config/environment.config";
import { createStructuredLoggerParams } from "../shared/observability/structured-logging";
import { HttpExceptionLoggingFilter } from "../shared/filters/http-exception-logging.filter";

@Module({
  imports: [
    LoggerModule.forRoot(createStructuredLoggerParams()),
    ScheduleModule.forRoot(),
    PrismaModule,
    AlertsModule,
    UserModule,
    AuthModule,
    DatabaseConnectionModule,
    DatabaseMetricModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ReadinessService,
    {
      provide: APP_READINESS_TIMEOUT_MS,
      useFactory: getAppReadinessTimeoutMs,
    },
    HttpExceptionLoggingFilter,
  ],
})
export class AppModule {}
