import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidAlertRuleIdError extends DomainError {
    constructor(reason: string);
}
