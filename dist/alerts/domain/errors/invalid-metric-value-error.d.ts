import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidMetricValueError extends DomainError {
    constructor(reason: string);
}
