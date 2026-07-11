import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidPortError extends DomainError {
    constructor(reason: string);
}
