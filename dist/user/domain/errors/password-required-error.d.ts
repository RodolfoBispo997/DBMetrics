import { DomainError } from "./domain-error";
export declare class PasswordRequiredError extends DomainError {
    constructor(reason: string);
}
