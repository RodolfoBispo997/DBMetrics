import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../../../../user/application/repositories/user-repository";
import { DatabaseConnection } from "../../../domain/entities/database-connection";
import { UserNotFoundError } from "../../../domain/errors/user-not-found-error";
import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { CreateDatabaseConnectionRequestDto } from "./dto/create-database-connection-request.dto";
import { CreateDatabaseConnectionResponseDto } from "./dto/create-database-connection-response.dto";

@Injectable()
export class CreateDatabaseConnectionUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    data: CreateDatabaseConnectionRequestDto,
  ): Promise<CreateDatabaseConnectionResponseDto> {
    const databaseConnection = DatabaseConnection.create({
      name: data.name,
      provider: data.provider,
      host: data.host,
      port: data.port,
      database: data.database,
      username: data.username,
      password: data.password,
      userId: data.userId,
    });

    const user = await this.userRepository.findById(databaseConnection.userId);

    if (!user) {
      throw new UserNotFoundError("User not found");
    }

    await this.databaseConnectionRepository.save(databaseConnection);

    return {
      id: databaseConnection.id,
      name: databaseConnection.name,
      provider: databaseConnection.provider,
      host: databaseConnection.host,
      port: databaseConnection.port,
      database: databaseConnection.database,
      username: databaseConnection.username,
      userId: databaseConnection.userId,
    };
  }
}
