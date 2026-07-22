import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class DashboardMetricsChartQueryHttpDTO {
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
}
