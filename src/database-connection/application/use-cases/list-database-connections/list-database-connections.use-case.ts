import { Inject, Injectable } from "@nestjs/common";
import { DatabaseConnectionRepository } from "../../repositories/database-connection-repository";
import { ListDatabaseConnectionsRequestDTO } from "./dto/list-database-connections-request.dto";
import { ListDatabaseConnectionsResponseDTO } from "./dto/list-database-connections-response.dto";

@Injectable()
export class ListDatabaseConnectionsUseCase {
  constructor(
    @Inject("DatabaseConnectionRepository")
    private readonly databaseConnectionRepository: DatabaseConnectionRepository,
  ) {}

  async execute(
    data: ListDatabaseConnectionsRequestDTO,
  ): Promise<ListDatabaseConnectionsResponseDTO[]> {
    const connections =
      await this.databaseConnectionRepository.findManyByUserId(data.userId);

    return connections.map((connection) => ({
      id: connection.id,
      name: connection.name,
      provider: connection.provider,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
    }));
  }
}
