export declare class DomainError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode: number);
}
