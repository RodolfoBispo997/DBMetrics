import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";

export class ResendVerificationHttpDTO {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsEmail()
  @ApiProperty({
    description: "Email address awaiting confirmation",
    example: "ada@example.com",
  })
  email!: string;
}
