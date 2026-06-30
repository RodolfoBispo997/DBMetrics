import { DatabaseProvider } from "../../domain/enums/database-provider.enum";
export declare class CreateDatabaseConnectionHttpDTO {
    name: string;
    provider: DatabaseProvider;
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
}
