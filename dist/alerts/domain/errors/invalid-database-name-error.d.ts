import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidDatabaseNameError extends DomainError {
    constructor(reason: string);
}
