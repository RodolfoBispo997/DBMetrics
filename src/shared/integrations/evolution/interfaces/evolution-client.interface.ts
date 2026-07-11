export interface SendTextRequest {
  instance: string;
  number: string;
  text: string;
}

export interface EvolutionClient {
  sendText(data: SendTextRequest): Promise<void>;
}
