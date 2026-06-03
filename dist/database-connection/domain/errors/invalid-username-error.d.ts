import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidUsernameError extends DomainError {
    constructor(reason: string);
}
