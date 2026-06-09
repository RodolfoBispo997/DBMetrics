import { DatabaseProvider } from "../../../../domain/enums/database-provider.enum";
export type GetDatabaseConnectionByIdResponseDTO = {
    id: string;
    name: string;
    provider: DatabaseProvider;
    host: string;
    port: number;
    database: string;
    username: string;
    userId: string;
};
