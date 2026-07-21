import { Module } from "@nestjs/common";
import { EvolutionConfig } from "./evolution.config";
import { HttpEvolutionClient } from "./evolution.client";
import { EvolutionService } from "./evolution.service";
import { getEnvironmentConfig } from "../../config/environment.config";

@Module({
  providers: [
    {
      provide: "EvolutionConfig",
      useFactory: (): EvolutionConfig => getEnvironmentConfig().evolution,
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
