import { DomainError } from "../../../user/domain/errors/domain-error";
export declare class InvalidViewsCountError extends DomainError {
    constructor(reason: string);
}
