import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidActiveConnectionsError extends DomainError {
    constructor(reason: string);
}
