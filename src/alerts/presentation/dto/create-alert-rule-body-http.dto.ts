import { IsEnum, IsIn, IsInt, IsNumber, IsString, IsUUID, Max, Min } from "class-validator";
import { AlertMetric } from "../../domain/enums/alert-metric.enum";
import { AlertOperator } from "../../domain/enums/alert-operator.enum";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAlertRuleBodyHttpDTO {
  @IsEnum(AlertMetric)
  @ApiProperty({ enum: AlertMetric, description: "Metric monitored by the rule" })
  metric!: AlertMetric;

  @IsEnum(AlertOperator)
  @ApiProperty({ enum: AlertOperator, description: "Comparison operator" })
  operator!: AlertOperator;

  @IsNumber()
  @ApiProperty({ description: "Threshold value", example: 80 })
  threshold!: number;

  @IsIn([NotificationChannel.WHATSAPP])
  @ApiProperty({
    enum: [NotificationChannel.WHATSAPP],
    description: "Notification channel",
    example: NotificationChannel.WHATSAPP,
  })
  channel!: NotificationChannel;

  @IsString()
  @ApiProperty({ description: "Notification destination", example: "5511999999999" })
  destination!: string;

  @IsInt()
  @Min(1)
  @Max(10080)
  @ApiProperty({
    description:
      "Minimum interval in minutes between successful notifications while the alert remains triggered.",
    example: 30,
  })
  cooldownMinutes!: number;

  @IsUUID()
  @ApiProperty({
    description: "Database connection identifier",
    example: "a36c0ca4-b6c8-48e4-a9f5-8499c8f4d45d",
    format: "uuid",
  })
  connectionId!: string;
}
