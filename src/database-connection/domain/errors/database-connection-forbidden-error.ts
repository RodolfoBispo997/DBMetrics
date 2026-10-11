import { DomainError } from "@/shared/errors/domain-error";

export class DatabaseConnectionForbiddenError extends DomainError {
  constructor() {
    super("You do not have permission to access this database connection", 403);
  }
}
