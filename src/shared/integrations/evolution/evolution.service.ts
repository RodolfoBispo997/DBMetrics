import { Inject, Injectable } from "@nestjs/common";
import { EvolutionClient } from "./interfaces/evolution-client.interface";
import { EvolutionConfig } from "./evolution.config";

@Injectable()
export class EvolutionService {
  constructor(
    @Inject("EvolutionClient")
    private readonly client: EvolutionClient,

    @Inject("EvolutionConfig")
    private readonly config: EvolutionConfig,
  ) {}

  async sendText(number: string, text: string): Promise<void> {
    await this.client.sendText({
      instance: this.config.instance,
      number,
      text,
    });
  }
}
