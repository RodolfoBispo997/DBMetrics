import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidDatabaseVersionError extends DomainError {
    constructor(reason: string);
}
