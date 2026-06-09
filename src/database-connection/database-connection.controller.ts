import {
  Body,
  Controller,
  Get,
  Param,
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

@Controller("database-connections")
export class DatabaseConnectionController {
  constructor(
    private readonly createDatabaseConnectionUseCase: CreateDatabaseConnectionUseCase,
    private readonly listDatabaseConnectionsUseCase: ListDatabaseConnectionsUseCase,
    private readonly getDatabaseConnectionByIdUseCase: GetDatabaseConnectionByIdUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post()
  async create(@Body() body: CreateDatabaseConnectionHttpDTO) {
    return this.createDatabaseConnectionUseCase.execute(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() request: any) {
    return this.listDatabaseConnectionsUseCase.execute({
      userId: request.user.sub,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async findById(@Req() request: any, @Param("id") id: string) {
    const userId = request.user.userId;
    return this.getDatabaseConnectionByIdUseCase.execute({ id, userId });
  }
}
