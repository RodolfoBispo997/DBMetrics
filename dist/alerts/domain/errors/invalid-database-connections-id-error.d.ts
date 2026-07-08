import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidDatabaseConnectionsIdError extends DomainError {
    constructor(reason: string);
}
