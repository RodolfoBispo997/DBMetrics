import { Injectable } from "@nestjs/common";
import { NotificationFactory } from "../../application/services/notification-factory.service";
import { EvolutionNotificationService } from "./evolution/evolution-notification.service";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";
import { NotificationService } from "../../application/services/notification.service";

@Injectable()
export class NotificationFactoryImpl implements NotificationFactory {
  constructor(private readonly evolution: EvolutionNotificationService) {}

  get(channel: NotificationChannel): NotificationService {
    switch (channel) {
      case NotificationChannel.WHATSAPP:
        return this.evolution;

      default:
        throw new Error("Notification channel not implemented");
    }
  }
}
