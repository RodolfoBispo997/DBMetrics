import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidIndexesCountError extends DomainError {
    constructor(reason: string);
}
