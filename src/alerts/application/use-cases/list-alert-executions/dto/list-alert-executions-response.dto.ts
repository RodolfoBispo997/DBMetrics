import { AlertExecution } from "../../../../domain/entities/alert-execution";

export interface ListAlertExecutionsResponseDTO {
  executions: AlertExecution[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
