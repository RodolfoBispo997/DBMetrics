import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class UserNotFoundError extends DomainError {
    constructor(reason: string);
}
