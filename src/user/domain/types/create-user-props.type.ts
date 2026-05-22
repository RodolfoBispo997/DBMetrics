import { UserRole } from "../enums/user-role.enum";

export type CreateUserProps = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};
