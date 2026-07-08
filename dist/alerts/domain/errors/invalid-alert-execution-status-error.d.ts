import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidAlertExecutionStatusError extends DomainError {
    constructor(reason: string);
}
