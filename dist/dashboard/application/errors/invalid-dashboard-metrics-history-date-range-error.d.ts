import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidDashboardMetricsHistoryDateRangeError extends DomainError {
    constructor(reason: string);
}
