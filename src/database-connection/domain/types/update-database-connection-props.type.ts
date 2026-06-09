import { DatabaseProvider } from "../enums/database-provider.enum";

export type UpdateDatabaseConnectionProps = {
  name: string;
  provider: DatabaseProvider;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
};
