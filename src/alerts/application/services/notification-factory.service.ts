import { NotificationChannel } from "../../domain/enums/notification-channel.enum";
import { NotificationService } from "./notification.service";

export interface NotificationFactory {
  get(channel: NotificationChannel): NotificationService;
}
