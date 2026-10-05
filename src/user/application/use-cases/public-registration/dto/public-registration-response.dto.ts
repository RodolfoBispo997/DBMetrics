import { ApiProperty } from "@nestjs/swagger";

export class PublicRegistrationResponseDTO {
  @ApiProperty({
    example:
      "If your information is valid, an email confirmation message will be sent shortly.",
  })
  message!: string;
}
