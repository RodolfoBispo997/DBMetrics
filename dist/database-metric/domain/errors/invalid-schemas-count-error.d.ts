import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidSchemasCountError extends DomainError {
    constructor(reason: string);
}
