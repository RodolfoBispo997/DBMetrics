import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidConnectionNameError extends DomainError {
    constructor(reason: string);
}
