import { CreateUserProps } from "../types/create-user-props.type";
import { UserRole } from "../enums/user-role.enum";
export declare class User {
    private props;
    private constructor();
    static create(props: CreateUserProps): User;
    private static validateAndNormalizeName;
    private static validateAndNormalizeEmail;
    changeName(name: string): void;
    changePassword(password: string): void;
    private static validatePassword;
    get id(): string;
    get name(): string;
    get email(): string;
    get role(): UserRole;
    get password(): string;
}
