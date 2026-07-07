import { Inject, Injectable } from "@nestjs/common";

import { AlertRuleRepository } from "../../repositories/alert-rule-repository";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";

import { GetAlertRuleRequestDTO } from "./dto/get-alert-rule-request.dto";
import { GetAlertRuleResponseDTO } from "./dto/get-alert-rule-response.dto";
import { AlertRuleNotFoundError } from "../../../domain/errors/alert-rule-not-found-error";

@Injectable()
export class GetAlertRuleUseCase {
  constructor(
    @Inject("AlertRuleRepository")
    private readonly alertRuleRepository: AlertRuleRepository,

    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
  ) {}

  async execute(
    data: GetAlertRuleRequestDTO,
  ): Promise<GetAlertRuleResponseDTO> {
    const alertRule = await this.alertRuleRepository.findById(data.alertRuleId);

    if (!alertRule) {
      throw new AlertRuleNotFoundError("Alert rule not found");
    }

    const connection = await this.databaseConnectionRepository.findById(
      alertRule.databaseConnectionId,
    );

    if (!connection || connection.userId !== data.userId) {
      throw new AlertRuleNotFoundError("Alert rule not found");
    }

    return {
      id: alertRule.id,

      metric: alertRule.metric,
      operator: alertRule.operator,
      threshold: alertRule.threshold,

      channel: alertRule.channel,

      enabled: alertRule.enabled,

      databaseConnectionId: alertRule.databaseConnectionId,

      createdAt: alertRule.createdAt,
      updatedAt: alertRule.updatedAt,
    };
  }
}
