import { Injectable } from "@nestjs/common";

import { NotificationService } from "../../../application/services/notification.service";
import { AlertExecution } from "../../../domain/entities/alert-execution";
import { EvolutionMessageBuilder } from "./evolution-message.builder";
import { EvolutionService } from "../../../../shared/integrations/evolution/evolution.service";

@Injectable()
export class EvolutionNotificationService implements NotificationService {
  constructor(private readonly evolutionService: EvolutionService) {}

  async send(execution: AlertExecution): Promise<void> {
    const message = EvolutionMessageBuilder.build(execution);

    // Chama a Evolution API
    await this.evolutionService.sendText(execution.destination, message);
  }
}
