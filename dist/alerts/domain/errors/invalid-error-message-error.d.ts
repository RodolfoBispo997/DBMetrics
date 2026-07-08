import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidErrorMessageError extends DomainError {
    constructor(reason: string);
}
