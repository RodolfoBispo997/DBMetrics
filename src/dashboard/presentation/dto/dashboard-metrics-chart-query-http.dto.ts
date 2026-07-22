import { IsOptional, IsString } from "class-validator";

export class DashboardMetricsChartQueryHttpDTO {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
