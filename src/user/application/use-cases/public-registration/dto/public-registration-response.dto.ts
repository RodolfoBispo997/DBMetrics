import { UserRole } from "../../../../domain/enums/user-role.enum";

export type PublicRegistrationResponseDTO = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
