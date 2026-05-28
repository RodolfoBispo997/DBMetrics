import { UnauthorizedException } from "@nestjs/common";
export declare class InvalidCredentialsError extends UnauthorizedException {
    constructor(message: string);
}
