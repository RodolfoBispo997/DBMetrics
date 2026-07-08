import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidAlertOperatorError extends DomainError {
    constructor(reason: string);
}
