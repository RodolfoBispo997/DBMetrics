import { randomUUID } from "node:crypto";
import { InvalidConnectionNameError } from "../errors/invalid-connection-name-error";
import { InvalidDatabaseNameError } from "../errors/invalid-database-name-error";
import { InvalidHostError } from "../errors/invalid-host-error";
import { InvalidPasswordError } from "../errors/invalid-password-error";
import { InvalidPortError } from "../errors/invalid-port-error";
import { InvalidUsernameError } from "../errors/invalid-username-error";
import { DatabaseConnectionProps } from "../types/database-connection-props.type";
import { CreateConnectionProps } from "../types/create-database-connection-props.types";
import { InvalidUserIdError } from "../errors/invalid-user-id-error";
import { DatabaseProvider } from "../enums/database-provider.enum";
import { InvalidProviderDatabaseError } from "../errors/invalid-provider-database-error";
import { UpdateDatabaseConnectionProps } from "../types/update-database-connection-props.type";

export class DatabaseConnection {
  private constructor(private readonly props: DatabaseConnectionProps) {}

  public static create(props: CreateConnectionProps): DatabaseConnection {
    const name = this.validateName(props.name);
    const host = this.validateHost(props.host);
    const port = this.validatePort(props.port);
    const database = this.validateDatabase(props.database);
    const username = this.validateUsername(props.username);
    const password = this.validatePassword(props.password);
    const provider = this.validateDatabaseProvider(props.provider);
    const userId = this.validateUserId(props.userId);

    return new DatabaseConnection({
      id: randomUUID(),
      name: name,
      provider: provider,
      host: host,
      port: port,
      database: database,
      username: username,
      password: password,
      userId: userId,
    });
  }

  private static validateName(name: string): string {
    const normalized = name.trim().replace(/\s+/g, " ");

    if (!normalized) {
      throw new InvalidConnectionNameError("Name cannot be empty");
    }

    return normalized;
  }

  public update(props: UpdateDatabaseConnectionProps): void {
    this.props.name = DatabaseConnection.validateName(props.name);

    this.props.provider = DatabaseConnection.validateDatabaseProvider(
      props.provider,
    );

    this.props.host = DatabaseConnection.validateHost(props.host);

    this.props.port = DatabaseConnection.validatePort(props.port);

    this.props.database = DatabaseConnection.validateDatabase(props.database);

    this.props.username = DatabaseConnection.validateUsername(props.username);

    this.props.password = DatabaseConnection.validatePassword(props.password);
  }

  private static validateHost(host: string): string {
    const normalized = host.trim().replace(/\s+/g, " ");

    if (!normalized) {
      throw new InvalidHostError("Host cannot not be empty");
    }

    return normalized;
  }
  private static validatePort(port: number): number {
    if (!Number.isInteger(port)) {
      throw new InvalidPortError("Port must be an integer");
    }

    if (port <= 0) {
      throw new InvalidPortError("Port must be greater than zero");
    }

    if (port > 65535) {
      throw new InvalidPortError("Port must be less than or equal to 65535");
    }

    return port;
  }

  private static validateDatabase(dataBase: string): string {
    const normalized = dataBase.trim().replace(/\s+/g, " ");

    if (!normalized) {
      throw new InvalidDatabaseNameError("Database cannot not be empty");
    }

    return normalized;
  }
  private static validateUsername(username: string): string {
    const normalized = username.trim().replace(/\s+/g, " ");

    if (!normalized) {
      throw new InvalidUsernameError("User Name cannot not be empty");
    }

    return normalized;
  }

  private static validatePassword(password: string): string {
    const normalized = password.trim().replace(/\s+/g, " ");

    if (!normalized) {
      throw new InvalidPasswordError("Password cannot not be empty");
    }

    return normalized;
  }

  private static validateUserId(userId: string): string {
    const normalized = userId.trim().replace(/\s+/g, " ");
    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!normalized) {
      throw new InvalidUserIdError("UserId cannot not be empty");
    }

    if (!UUID_REGEX.test(normalized)) {
      throw new InvalidUserIdError("Invalid user id");
    }

    return normalized;
  }

  private static validateDatabaseProvider(
    value: DatabaseProvider,
  ): DatabaseProvider {
    if (!Object.values(DatabaseProvider).includes(value)) {
      throw new InvalidProviderDatabaseError("Invalid database provider");
    }

    return value;
  }
  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get provider() {
    return this.props.provider;
  }

  get host() {
    return this.props.host;
  }

  get port() {
    return this.props.port;
  }

  get database() {
    return this.props.database;
  }

  get username() {
    return this.props.username;
  }

  get password() {
    return this.props.password;
  }

  get userId() {
    return this.props.userId;
  }
}
