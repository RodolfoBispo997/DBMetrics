import { Inject, Injectable } from "@nestjs/common";

import { AlertExecutionRepository } from "../../repositories/alert-execution-repository";

import { AlertExecution } from "../../../domain/entities/alert-execution";

import { AlertExecutionNotFoundError } from "../../../domain/errors/alert-execution-not-found-error";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { GetAlertExecutionRequestDTO } from "./dto/get-alert-execution-request.dto";

@Injectable()
export class GetAlertExecutionUseCase {
  constructor(
    @Inject("AlertExecutionRepository")
    private readonly alertExecutionRepository: AlertExecutionRepository,

    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
  ) {}

  async execute({
    executionId,
    userId,
  }: GetAlertExecutionRequestDTO): Promise<AlertExecution> {
    const execution = await this.alertExecutionRepository.findById(executionId);

    if (!execution) {
      throw new AlertExecutionNotFoundError();
    }

    const connection = await this.databaseConnectionRepository.findById(
      execution.databaseConnectionId,
    );

    if (!connection || connection.userId !== userId) {
      throw new AlertExecutionNotFoundError();
    }

    return execution;
  }
}
