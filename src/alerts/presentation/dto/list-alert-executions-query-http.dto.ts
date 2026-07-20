import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

export class ListAlertExecutionsQueryHttpDTO {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize: number = 10;
}
