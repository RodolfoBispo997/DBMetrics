import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidHostError extends DomainError {
    constructor(reason: string);
}
