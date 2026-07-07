import { Inject, Injectable } from "@nestjs/common";

import { AlertRuleRepository } from "../../repositories/alert-rule-repository";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";

import { AlertRule } from "../../../domain/entities/alert-rule";

import { DatabaseConnectionNotFoundError } from "../../../../database-connection/domain/errors/database-connection-not-found-error";

import { CreateAlertRuleRequestDTO } from "./dto/create-alert-rule-request.dto";
import { CreateAlertRuleResponseDTO } from "./dto/create-alert-rule-response.dto";

@Injectable()
export class CreateAlertRuleUseCase {
  constructor(
    @Inject("AlertRuleRepository")
    private readonly alertRuleRepository: AlertRuleRepository,

    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
  ) {}

  async execute(
    data: CreateAlertRuleRequestDTO,
  ): Promise<CreateAlertRuleResponseDTO> {
    const connection = await this.databaseConnectionRepository.findById(
      data.connectionId,
    );

    if (!connection || connection.userId !== data.userId) {
      throw new DatabaseConnectionNotFoundError("Connection not found");
    }

    const alertRule = AlertRule.create({
      metric: data.metric,
      operator: data.operator,
      threshold: data.threshold,
      channel: data.channel,

      databaseConnectionId: connection.id,
    });

    await this.alertRuleRepository.save(alertRule);

    return {
      id: alertRule.id,
    };
  }
}
