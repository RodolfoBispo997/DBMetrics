import { DatabaseProvider } from "../../../../domain/enums/database-provider.enum";

export type CreateDatabaseConnectionRequestDto = {
  name: string;
  provider: DatabaseProvider;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  userId: string;
};
