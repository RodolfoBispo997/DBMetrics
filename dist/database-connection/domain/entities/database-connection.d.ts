import { CreateConnectionProps } from "../types/create-database-connection-props.types";
import { DatabaseProvider } from "../enums/database-provider.enum";
export declare class DatabaseConnection {
    private readonly props;
    private constructor();
    static create(props: CreateConnectionProps): DatabaseConnection;
    private static validateName;
    private static validateHost;
    private static validatePort;
    private static validateDatabase;
    private static validateUsername;
    private static validatePassword;
    private static validateUserId;
    private static validateDatabaseProvider;
    get id(): string;
    get name(): string;
    get provider(): DatabaseProvider;
    get host(): string;
    get port(): number;
    get database(): string;
    get username(): string;
    get password(): string;
    get userId(): string;
}
