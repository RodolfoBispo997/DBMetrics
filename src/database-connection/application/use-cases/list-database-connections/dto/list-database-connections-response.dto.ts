import { DatabaseProvider } from "../../../../domain/enums/database-provider.enum";

export type ListDatabaseConnectionsResponseDTO = {
  id: string;
  name: string;
  provider: DatabaseProvider;
};
