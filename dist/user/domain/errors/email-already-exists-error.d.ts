import { DomainError } from "./domain-error";
export declare class EmailAlreadyExistsError extends DomainError {
    constructor(reason: string);
}
