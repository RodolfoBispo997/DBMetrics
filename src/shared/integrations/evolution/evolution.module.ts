import { Module } from "@nestjs/common";
import { EvolutionConfig } from "./evolution.config";
import { HttpEvolutionClient } from "./evolution.client";
import { EvolutionService } from "./evolution.service";

@Module({
  providers: [
    {
      provide: "EvolutionConfig",
      useFactory: (): EvolutionConfig => ({
        baseUrl: process.env.EVOLUTION_API_URL!,
        apiKey: process.env.EVOLUTION_API_KEY!,
        instance: process.env.EVOLUTION_INSTANCE!,
      }),
    },
    {
      provide: "EvolutionClient",
      useClass: HttpEvolutionClient,
    },
    EvolutionService,
  ],
  exports: [EvolutionService],
})
export class EvolutionModule {}
