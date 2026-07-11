import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidDestinationError extends DomainError {
    constructor(reason: string);
}
