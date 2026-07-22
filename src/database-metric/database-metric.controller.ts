import {
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CollectDatabaseMetricUseCase } from "./application/use-cases/collect-database-metric/collect-database-metric.use-case";
import { GetDatabaseMetricUseCase } from "./application/use-cases/get-database-metric/get-database-metric.use-case";
import { GetDatabaseMetricResponseDTO } from "./application/use-cases/get-database-metric/dto/get-database-metric-response.dto";
import type { AuthenticatedRequest } from "../auth/types/authenticated-request";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@ApiTags("Database Metrics")
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@Controller("database-metrics")
export class DatabaseMetricController {
  constructor(
    private readonly collectDatabaseMetricUseCase: CollectDatabaseMetricUseCase,
    private readonly getDatabaseMetricUseCase: GetDatabaseMetricUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(":id/collect")
  @ApiOperation({ summary: "Collect database metrics" })
  @ApiOkResponse({
    description:
      "Collects and persists a new metric snapshot for the selected database connection.",
  })
  @ApiParam({
    name: "id",
    description: "Database connection identifier",
    example: "a36c0ca4-b6c8-48e4-a9f5-8499c8f4d45d",
    format: "uuid",
  })
  @HttpCode(HttpStatus.OK)
  async collect(
    @Req() request: AuthenticatedRequest,
    @Param("id") connectionId: string,
  ): Promise<{ message: string }> {
    const userId = request.user.userId;

    await this.collectDatabaseMetricUseCase.execute({
      connectionId,
      userId,
    });

    return {
      message: "Metric collected successfully",
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/history")
  @ApiOperation({ summary: "Get database metrics history" })
  @ApiOkResponse({
    description: "Returns the metric history for the selected database connection.",
  })
  @ApiParam({
    name: "id",
    description: "Database connection identifier",
    example: "a36c0ca4-b6c8-48e4-a9f5-8499c8f4d45d",
    format: "uuid",
  })
  async get(
    @Req() request: AuthenticatedRequest,
    @Param("id") connectionId: string,
  ): Promise<GetDatabaseMetricResponseDTO[]> {
    const userId = request.user.userId;

    return this.getDatabaseMetricUseCase.execute({
      connectionId,
      userId,
    });
  }
}
