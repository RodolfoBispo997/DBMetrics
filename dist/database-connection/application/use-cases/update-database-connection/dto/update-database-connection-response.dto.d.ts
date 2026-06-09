import { DatabaseProvider } from "../../../../domain/enums/database-provider.enum";
export type UpdateDatabaseConnectionResponseDTO = {
    name: string;
    provider: DatabaseProvider;
    host: string;
    port: number;
    database: string;
    username: string;
};
