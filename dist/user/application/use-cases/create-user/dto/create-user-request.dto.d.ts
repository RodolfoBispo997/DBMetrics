import { UserRole } from "../../../../domain/enums/user-role.enum";
export type CreateUserRequestDTO = {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
};
