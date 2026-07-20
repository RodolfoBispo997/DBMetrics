import { Inject, Injectable } from "@nestjs/common";

import { AlertExecutionRepository } from "../../repositories/alert-execution-repository";

import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { InvalidDatabaseConnectionIdError } from "../../../../database-metric/domain/errors/invalid-database-connection-id-error";
import { ListAlertExecutionsRequestDTO } from "./dto/list-alert-executions-request.dto";
import { ListAlertExecutionsResponseDTO } from "./dto/list-alert-executions-response.dto";

@Injectable()
export class ListAlertExecutionsUseCase {
  constructor(
    @Inject("AlertExecutionRepository")
    private readonly alertExecutionRepository: AlertExecutionRepository,

    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
  ) {}

  async execute({
    connectionId, userId, page, pageSize,
  }: ListAlertExecutionsRequestDTO): Promise<ListAlertExecutionsResponseDTO> {
    const connection =
      await this.databaseConnectionRepository.findById(connectionId);

    if (!connection || connection.userId !== userId) {
      throw new InvalidDatabaseConnectionIdError(
        "Database connection not found",
      );
    }

    const { executions, total } =
      await this.alertExecutionRepository.findManyByConnectionId({
        connectionId,
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

    return {
      executions,
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    };
  }
}
