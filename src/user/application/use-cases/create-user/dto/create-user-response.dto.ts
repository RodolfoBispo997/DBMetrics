import { UserRole } from "../../../../domain/enums/user-role.enum";

export type CreateUserResponseDTO = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
