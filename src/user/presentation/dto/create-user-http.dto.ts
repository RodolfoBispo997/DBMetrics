import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserHttpDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "User name", example: "Ada Lovelace" })
  name!: string;

  @IsEmail()
  @ApiProperty({ description: "User email address", example: "ada@example.com" })
  email!: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({
    description: "User password",
    example: "StrongPassword123!",
    minLength: 8,
    format: "password",
  })
  password!: string;
}
