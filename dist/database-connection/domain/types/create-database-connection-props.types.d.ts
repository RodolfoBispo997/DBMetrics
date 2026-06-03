import { DatabaseProvider } from "../enums/database-provider.enum";
export interface CreateConnectionProps {
    name: string;
    provider: DatabaseProvider;
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    userId: string;
}
