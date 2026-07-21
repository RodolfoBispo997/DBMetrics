import { Module } from "@nestjs/common";
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

@Module({
  imports: [
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
  providers: [AppService],
})
export class AppModule {}
