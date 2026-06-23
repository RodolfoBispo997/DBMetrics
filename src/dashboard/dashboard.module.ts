import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { GetDashboardOverviewUseCase } from "./application/use-cases/get-dashboard-overview/get-dashboard-overview.use-case";
import { PrismaDatabaseConnectionRepository } from "../database-connection/infra/repositories/prisma-database-connection.repository";
import { PrismaDatabaseMetricRepository } from "../database-metric/infra/repositories/prisma-database-metric.repository";

@Module({
  controllers: [DashboardController],
  providers: [
    GetDashboardOverviewUseCase,

    {
      provide: "DatabaseConnectionRepository",
      useClass: PrismaDatabaseConnectionRepository,
    },
    {
      provide: "DatabaseMetricRepository",
      useClass: PrismaDatabaseMetricRepository,
    },
  ],
})
export class DashboardModule {}
