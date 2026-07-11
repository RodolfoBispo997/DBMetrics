import { EvolutionClient } from "./interfaces/evolution-client.interface";
import { EvolutionConfig } from "./evolution.config";
export declare class EvolutionService {
    private readonly client;
    private readonly config;
    constructor(client: EvolutionClient, config: EvolutionConfig);
    sendText(number: string, text: string): Promise<void>;
}
