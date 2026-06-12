import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidDatabaseSizeError extends DomainError {
    constructor(reason: string);
}
