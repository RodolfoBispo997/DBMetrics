import { Module } from "@nestjs/common";
import { AlertsController } from "./alerts.controller";
import { CreateAlertRuleUseCase } from "./application/use-cases/create-alert-rule/create-alert-rule.use-case";
import { PrismaAlertRuleRepository } from "./infra/repositories/prisma-alert-rule-repository";
import { PrismaDatabaseConnectionRepository } from "../database-connection/infra/repositories/prisma-database-connection.repository";
import { GetAlertRuleUseCase } from "./application/use-cases/get-alert-rule/get-alert-rule.use-case";
import { ListAlertRulesUseCase } from "./application/use-cases/list-alert-rules/list-alert-rules.use-case";
import { UpdateAlertRuleUseCase } from "./application/use-cases/update-alert-rule/update-alert-rule.use-case";
import { EnableAlertRuleUseCase } from "./application/use-cases/enable-alert-rule/enable-alert-rule.use-case";
import { DisableAlertRuleUseCase } from "./application/use-cases/disable-alert-rule/disable-alert-rule.use-case";
import { DeleteAlertRuleUseCase } from "./application/use-cases/delete-alert-rule/delete-alert-rule.use-case";
import { AlertEvaluatorService } from "./application/services/alert-evaluator.service";
import { AlertProcessorService } from "./application/services/alert-processor.service";

@Module({
  controllers: [AlertsController],
  providers: [
    CreateAlertRuleUseCase,
    GetAlertRuleUseCase,
    ListAlertRulesUseCase,
    UpdateAlertRuleUseCase,
    EnableAlertRuleUseCase,
    DisableAlertRuleUseCase,
    DeleteAlertRuleUseCase,
    AlertEvaluatorService,
    AlertProcessorService,
    {
      provide: "AlertRuleRepository",
      useClass: PrismaAlertRuleRepository,
    },
    {
      provide: "DatabaseConnectionRepository",
      useClass: PrismaDatabaseConnectionRepository,
    },
  ],
  exports: [AlertProcessorService],
})
export class AlertsModule {}
