import { AlertExecutionRepository } from "../../repositories/alert-execution-repository";
import { AlertExecution } from "../../../domain/entities/alert-execution";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { GetAlertExecutionRequestDTO } from "./dto/get-alert-execution-request.dto";
export declare class GetAlertExecutionUseCase {
    private readonly alertExecutionRepository;
    private readonly databaseConnectionRepository;
    constructor(alertExecutionRepository: AlertExecutionRepository, databaseConnectionRepository: DatabaseConnectionRepository);
    execute({ executionId, userId, }: GetAlertExecutionRequestDTO): Promise<AlertExecution>;
}
