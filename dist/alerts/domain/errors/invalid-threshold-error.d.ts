import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidThresholdError extends DomainError {
    constructor(reason: string);
}
