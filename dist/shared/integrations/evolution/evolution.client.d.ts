import { EvolutionClient, SendTextRequest } from "./interfaces/evolution-client.interface";
import { EvolutionConfig } from "./evolution.config";
export declare class HttpEvolutionClient implements EvolutionClient {
    private readonly config;
    private readonly http;
    constructor(config: EvolutionConfig);
    sendText(data: SendTextRequest): Promise<void>;
}
