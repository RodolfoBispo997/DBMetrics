import { Inject, Injectable } from "@nestjs/common";

import { AlertRuleRepository } from "../../repositories/alert-rule-repository";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";

import { AlertRuleNotFoundError } from "../../../domain/errors/alert-rule-not-found-error";
import { DatabaseConnectionNotFoundError } from "../../../../database-connection/domain/errors/database-connection-not-found-error";
import { AlertRule } from "../../../domain/entities/alert-rule";

import { UpdateAlertRuleRequestDTO } from "./dto/update-alert-rule-request.dto";

@Injectable()
export class UpdateAlertRuleUseCase {
  constructor(
    @Inject("AlertRuleRepository")
    private readonly alertRuleRepository: AlertRuleRepository,

    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
  ) {}

  async execute(
    data: UpdateAlertRuleRequestDTO,
  ): Promise<AlertRule> {
    const alertRule = await this.alertRuleRepository.findById(data.alertRuleId);

    if (!alertRule) {
      throw new AlertRuleNotFoundError("Alert not found");
    }

    const connection = await this.databaseConnectionRepository.findById(
      alertRule.databaseConnectionId,
    );

    if (!connection || connection.userId !== data.userId) {
      throw new DatabaseConnectionNotFoundError("Connection not found");
    }

    alertRule.update({
      metric: data.metric,
      operator: data.operator,
      threshold: data.threshold,
      channel: data.channel,
      destination: data.destination,
      cooldownMinutes: data.cooldownMinutes,
    });

    await this.alertRuleRepository.update(alertRule);

    return alertRule;
  }
}
