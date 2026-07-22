import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";
import { DatabaseProvider } from "../../domain/enums/database-provider.enum";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDatabaseConnectionHttpDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Connection name", example: "Production PostgreSQL" })
  name!: string;

  @IsEnum(DatabaseProvider)
  @ApiProperty({ enum: DatabaseProvider, description: "Database provider" })
  provider!: DatabaseProvider;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Database host", example: "db.example.com" })
  host!: string;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ description: "Database port", example: 5432 })
  port!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Database name", example: "dbmetrics" })
  database!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Database username", example: "dbmetrics_user" })
  username!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Database password",
    example: "StrongPassword123!",
    format: "password",
  })
  password!: string;
}
