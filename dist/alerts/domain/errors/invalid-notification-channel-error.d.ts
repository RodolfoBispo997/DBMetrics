import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidNotificationChannelError extends DomainError {
    constructor(reason: string);
}
