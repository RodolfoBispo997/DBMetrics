import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidAlertMetricError extends DomainError {
    constructor(reason: string);
}
