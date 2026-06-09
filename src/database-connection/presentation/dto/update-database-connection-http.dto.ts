import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";
import { DatabaseProvider } from "../../domain/enums/database-provider.enum";

export class UpdateDatabaseConnectionHttpDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(DatabaseProvider)
  provider!: DatabaseProvider;

  @IsString()
  @IsNotEmpty()
  host!: string;

  @Type(() => Number)
  @IsNumber()
  port!: number;

  @IsString()
  @IsNotEmpty()
  database!: string;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
