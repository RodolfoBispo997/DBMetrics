import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyEmailHttpDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Raw email confirmation token" })
  token!: string;
}
