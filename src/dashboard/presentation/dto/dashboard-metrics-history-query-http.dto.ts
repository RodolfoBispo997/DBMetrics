import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class DashboardMetricsHistoryQueryHttpDTO {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "Start date in ISO 8601 format",
    example: "2026-01-01T00:00:00.000Z",
  })
  startDate?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "End date in ISO 8601 format",
    example: "2026-01-31T23:59:59.999Z",
  })
  endDate?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "Page number", example: "1" })
  page?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "Results per page", example: "20" })
  limit?: string;
}
