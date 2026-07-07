import { Inject, Injectable } from "@nestjs/common";

import { AlertRuleRepository } from "../../repositories/alert-rule-repository";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";

import { DatabaseConnectionNotFoundError } from "../../../../database-connection/domain/errors/database-connection-not-found-error";

import { ListAlertRulesRequestDTO } from "./dto/list-alert-rules-request.dto";
import { ListAlertRulesResponseDTO } from "./dto/list-alert-rules-response.dto";

@Injectable()
export class ListAlertRulesUseCase {
  constructor(
    @Inject("AlertRuleRepository")
    private readonly alertRuleRepository: AlertRuleRepository,

    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
  ) {}

  async execute(
    data: ListAlertRulesRequestDTO,
  ): Promise<ListAlertRulesResponseDTO> {
    const connection = await this.databaseConnectionRepository.findById(
      data.connectionId,
    );

    if (!connection || connection.userId !== data.userId) {
      throw new DatabaseConnectionNotFoundError("Connection not found");
    }

    const alertRules = await this.alertRuleRepository.findManyByConnectionId(
      connection.id,
    );

    return {
      alerts: alertRules.map((alertRule) => ({
        id: alertRule.id,

        metric: alertRule.metric,
        operator: alertRule.operator,
        threshold: alertRule.threshold,

        channel: alertRule.channel,

        enabled: alertRule.enabled,

        createdAt: alertRule.createdAt,
        updatedAt: alertRule.updatedAt,
      })),
    };
  }
}
