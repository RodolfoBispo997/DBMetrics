import { DatabaseProvider } from "../../../../domain/enums/database-provider.enum";
export type UpdateDatabaseConnectionRequestDTO = {
    id: string;
    userId: string;
    name: string;
    provider: DatabaseProvider;
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
};
