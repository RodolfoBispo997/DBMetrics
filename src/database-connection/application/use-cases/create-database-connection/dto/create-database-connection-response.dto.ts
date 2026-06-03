import { DatabaseProvider } from "../../../../domain/enums/database-provider.enum";

export type CreateDatabaseConnectionResponseDto = {
  id: string;
  name: string;
  provider: DatabaseProvider;
  host: string;
  port: number;
  database: string;
  username: string;
  userId: string;
};
