import type { Request } from "express";
import type { UserRole } from "../../user/domain/enums/user-role.enum";

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}
