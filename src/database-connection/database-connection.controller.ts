import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

import { CreateDatabaseConnectionHttpDTO } from "./presentation/dto/create-database-connection-http.dto";
import { CreateDatabaseConnectionUseCase } from "./application/use-cases/create-database-connection/create-database-connection.use-case";
import { ListDatabaseConnectionsUseCase } from "./application/use-cases/list-database-connections/list-database-connections.use-case";
import { GetDatabaseConnectionByIdUseCase } from "./application/use-cases/get-database-connection-by-id/get-database-connections-by-id.use-case";
import { UpdateDatabaseConnectionUseCase } from "./application/use-cases/update-database-connection/update-database-connection.use-case";
import { UpdateDatabaseConnectionHttpDTO } from "./presentation/dto/update-database-connection-http.dto";
import { DeleteDatabaseConnectionUseCase } from "./application/use-cases/delete-database-connection/delete-database-connection.use-case";
import { TestDatabaseConnectionUseCase } from "./application/use-cases/test-database-connection/test-database-connection.use-case";
import { GetDatabaseMetricsUseCase } from "./application/use-cases/get-database-metrics/get-database-metrics.use-case";

@Controller("database-connections")
export class DatabaseConnectionController {
  constructor(
    private readonly createDatabaseConnectionUseCase: CreateDatabaseConnectionUseCase,
    private readonly listDatabaseConnectionsUseCase: ListDatabaseConnectionsUseCase,
    private readonly getDatabaseConnectionByIdUseCase: GetDatabaseConnectionByIdUseCase,
    private readonly updateDatabaseConnectionUseCase: UpdateDatabaseConnectionUseCase,
    private readonly deleteDatabaseConnectionUseCase: DeleteDatabaseConnectionUseCase,
    private readonly testDatabaseConnectionUseCase: TestDatabaseConnectionUseCase,
    private readonly getDatabaseMetricsUseCase: GetDatabaseMetricsUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post()
  async create(
    @Req() request: any,
    @Body() body: CreateDatabaseConnectionHttpDTO,
  ) {
    return this.createDatabaseConnectionUseCase.execute({
      ...body,
      userId: request.user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() request: any) {
    return this.listDatabaseConnectionsUseCase.execute({
      userId: request.user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async findById(@Req() request: any, @Param("id") id: string) {
    const userId = request.user.userId;
    return this.getDatabaseConnectionByIdUseCase.execute({ id, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async update(
    @Req() request: any,
    @Param("id") id: string,
    @Body() body: UpdateDatabaseConnectionHttpDTO,
  ) {
    const userId = request.user.userId;
    return this.updateDatabaseConnectionUseCase.execute({
      id,
      userId,
      name: body.name,
      provider: body.provider,
      host: body.host,
      port: body.port,
      database: body.database,
      username: body.username,
      password: body.password,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Delete(":id")
  async delete(@Req() request: any, @Param("id") id: string) {
    const userId = request.user.userId;
    return this.deleteDatabaseConnectionUseCase.execute({ id, userId });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post(":id/test")
  async test(@Req() request: any, @Param("id") connectionId: string) {
    const userId = request.user.userId;
    return this.testDatabaseConnectionUseCase.execute({ connectionId, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/metrics")
  async metrics(@Req() request: any, @Param("id") connectionId: string) {
    const userId = request.user.userId;
    return this.getDatabaseMetricsUseCase.execute({ connectionId, userId });
  }
}
