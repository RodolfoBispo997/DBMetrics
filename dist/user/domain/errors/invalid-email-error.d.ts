import { DomainError } from "./domain-error";
export declare class InvalidEmailError extends DomainError {
    constructor(reason: string);
}
