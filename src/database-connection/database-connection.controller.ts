import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { CreateDatabaseConnectionResponseDto } from "./application/use-cases/create-database-connection/dto/create-database-connection-response.dto";
import { ListDatabaseConnectionsResponseDTO } from "./application/use-cases/list-database-connections/dto/list-database-connections-response.dto";
import { GetDatabaseConnectionByIdResponseDTO } from "./application/use-cases/get-database-connection-by-id/dto/get-database-connection-by-id-response.dto";
import { UpdateDatabaseConnectionResponseDTO } from "./application/use-cases/update-database-connection/dto/update-database-connection-response.dto";
import { TestDatabaseConnectionResponseDTO } from "./application/use-cases/test-database-connection/dto/test-database-connection-response.dto";
import { GetDatabaseMetricsResponseDTO } from "./application/use-cases/get-database-metrics/dto/get-database-metrics-response.dto";
import type { AuthenticatedRequest } from "../auth/types/authenticated-request";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@ApiTags("Database Connections")
@ApiBearerAuth()
@ApiUnauthorizedResponse()
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
  @ApiOperation({ summary: "Create database connection" })
  @ApiCreatedResponse({ description: "Database connection created" })
  @ApiForbiddenResponse()
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateDatabaseConnectionHttpDTO,
  ): Promise<CreateDatabaseConnectionResponseDto> {
    return this.createDatabaseConnectionUseCase.execute({
      ...body,
      userId: request.user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: "List database connections" })
  @ApiOkResponse({ description: "Database connections retrieved" })
  async list(
    @Req() request: AuthenticatedRequest,
  ): Promise<ListDatabaseConnectionsResponseDTO[]> {
    return this.listDatabaseConnectionsUseCase.execute({
      userId: request.user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  @ApiOperation({ summary: "Get database connection" })
  @ApiOkResponse({ description: "Database connection retrieved" })
  async findById(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<GetDatabaseConnectionByIdResponseDTO> {
    const userId = request.user.userId;
    return this.getDatabaseConnectionByIdUseCase.execute({ id, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  @ApiOperation({ summary: "Update database connection" })
  @ApiOkResponse({ description: "Database connection updated" })
  async update(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: UpdateDatabaseConnectionHttpDTO,
  ): Promise<UpdateDatabaseConnectionResponseDTO> {
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
  @ApiOperation({ summary: "Delete database connection" })
  @ApiNoContentResponse()
  @ApiForbiddenResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<void> {
    const userId = request.user.userId;
    return this.deleteDatabaseConnectionUseCase.execute({ id, userId });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post(":id/test")
  @ApiOperation({ summary: "Test database connection" })
  @ApiOkResponse({ description: "Database connection test completed" })
  @ApiForbiddenResponse()
  @HttpCode(HttpStatus.OK)
  async test(
    @Req() request: AuthenticatedRequest,
    @Param("id") connectionId: string,
  ): Promise<TestDatabaseConnectionResponseDTO> {
    const userId = request.user.userId;
    return this.testDatabaseConnectionUseCase.execute({ connectionId, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/metrics")
  @ApiOperation({ summary: "Get database metrics" })
  @ApiOkResponse({ description: "Database metrics retrieved" })
  async metrics(
    @Req() request: AuthenticatedRequest,
    @Param("id") connectionId: string,
  ): Promise<GetDatabaseMetricsResponseDTO> {
    const userId = request.user.userId;
    return this.getDatabaseMetricsUseCase.execute({ connectionId, userId });
  }
}
