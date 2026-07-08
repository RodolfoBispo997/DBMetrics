import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidDatabaseMetricIdError extends DomainError {
    constructor(reason: string);
}
