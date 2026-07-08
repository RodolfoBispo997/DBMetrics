import { Inject, Injectable } from "@nestjs/common";

import { AlertExecutionRepository } from "../../repositories/alert-execution-repository";

import { AlertExecution } from "../../../domain/entities/alert-execution";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { InvalidDatabaseConnectionIdError } from "../../../../database-metric/domain/errors/invalid-database-connection-id-error";
import { ListAlertExecutionsRequestDTO } from "./dto/list-alert-executions-request.dto";

@Injectable()
export class ListAlertExecutionsUseCase {
  constructor(
    @Inject("AlertExecutionRepository")
    private readonly alertExecutionRepository: AlertExecutionRepository,

    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
  ) {}

  async execute({
    connectionId,
    userId,
  }: ListAlertExecutionsRequestDTO): Promise<AlertExecution[]> {
    const connection =
      await this.databaseConnectionRepository.findById(connectionId);

    if (!connection || connection.userId !== userId) {
      throw new InvalidDatabaseConnectionIdError(
        "Database connection not found",
      );
    }

    return this.alertExecutionRepository.findManyByConnectionId(connectionId);
  }
}
