import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidUserIdError extends DomainError {
    constructor(reason: string);
}
