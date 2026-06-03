import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

import { CreateDatabaseConnectionHttpDTO } from "./presentation/dto/create-database-connection-http.dto";
import { CreateDatabaseConnectionUseCase } from "./application/use-cases/create-database-connection/create-database-connection.use-case";

@Controller("database-connections")
export class DatabaseConnectionController {
  constructor(
    private readonly createDatabaseConnectionUseCase: CreateDatabaseConnectionUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post()
  async create(@Body() body: CreateDatabaseConnectionHttpDTO) {
    return this.createDatabaseConnectionUseCase.execute(body);
  }
}
