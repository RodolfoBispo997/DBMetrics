import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidFunctionsCountError extends DomainError {
    constructor(reason: string);
}
