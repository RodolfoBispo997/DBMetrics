import { AlertExecutionRepository } from "../../repositories/alert-execution-repository";
import { AlertExecution } from "../../../domain/entities/alert-execution";
import { DatabaseConnectionRepository } from "../../../../database-connection/application/repositories/database-connection-repository";
import { ListAlertExecutionsRequestDTO } from "./dto/list-alert-executions-request.dto";
export declare class ListAlertExecutionsUseCase {
    private readonly alertExecutionRepository;
    private readonly databaseConnectionRepository;
    constructor(alertExecutionRepository: AlertExecutionRepository, databaseConnectionRepository: DatabaseConnectionRepository);
    execute({ connectionId, userId, }: ListAlertExecutionsRequestDTO): Promise<AlertExecution[]>;
}
