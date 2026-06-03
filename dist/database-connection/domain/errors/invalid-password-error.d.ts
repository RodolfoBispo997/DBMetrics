import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidPasswordError extends DomainError {
    constructor(reason: string);
}
