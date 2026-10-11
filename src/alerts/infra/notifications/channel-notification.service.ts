import { Injectable } from "@nestjs/common";
import { NotificationService } from "../../application/services/notification.service";
import { AlertExecution } from "../../domain/entities/alert-execution";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";
import { NotificationFactory } from "../../application/services/notification-factory.service";

@Injectable()
export class ChannelNotificationService implements NotificationService {
  constructor(private readonly factory: NotificationFactory) {}

  send(execution: AlertExecution): Promise<void> {
    if (execution.channel !== NotificationChannel.WHATSAPP && execution.channel !== NotificationChannel.EMAIL) {
      throw new Error("Notification channel not implemented");
    }
    return this.factory.get(execution.channel).send(execution);
  }
}