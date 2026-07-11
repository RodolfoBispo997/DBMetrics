import { NotificationFactory } from "../../application/services/notification-factory.service";
import { EvolutionNotificationService } from "./evolution/evolution-notification.service";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";
import { NotificationService } from "../../application/services/notification.service";
export declare class NotificationFactoryImpl implements NotificationFactory {
    private readonly evolution;
    constructor(evolution: EvolutionNotificationService);
    get(channel: NotificationChannel): NotificationService;
}
