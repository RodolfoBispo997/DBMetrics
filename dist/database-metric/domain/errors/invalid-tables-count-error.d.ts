import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidTablesCountError extends DomainError {
    constructor(reason: string);
}
