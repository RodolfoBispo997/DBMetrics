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
  @ApiOkResponse({ description: "Database metrics collected" })
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
  @ApiOkResponse({ description: "Database metrics history retrieved" })
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
