import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidDatabaseConnectionIdError extends DomainError {
    constructor(reason: string);
}
