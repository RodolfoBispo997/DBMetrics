import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidDashboardDateRangeError extends DomainError {
    constructor(reason: string);
}
