import { IsEnum, IsNumber, IsUUID } from "class-validator";
import { AlertMetric } from "../../domain/enums/alert-metric.enum";
import { AlertOperator } from "../../domain/enums/alert-operator.enum";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";

export class CreateAlertRuleBodyHttpDTO {
  @IsEnum(AlertMetric)
  metric!: AlertMetric;

  @IsEnum(AlertOperator)
  operator!: AlertOperator;

  @IsNumber()
  threshold!: number;

  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @IsUUID()
  connectionId!: string;
}
