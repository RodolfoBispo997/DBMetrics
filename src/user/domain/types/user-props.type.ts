import { UserRole } from "../enums/user-role.enum";

export type UserProps = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
};
