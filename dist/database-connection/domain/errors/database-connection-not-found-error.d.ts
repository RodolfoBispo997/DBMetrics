import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class DatabaseConnectionNotFoundError extends DomainError {
    constructor(reason: string);
}
