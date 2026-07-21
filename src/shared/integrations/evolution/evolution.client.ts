import axios, { AxiosInstance } from "axios";
import { Inject, Injectable, Logger } from "@nestjs/common";
import {
  EvolutionClient,
  SendTextRequest,
} from "./interfaces/evolution-client.interface";
import { EvolutionConfig } from "./evolution.config";

@Injectable()
export class HttpEvolutionClient implements EvolutionClient {
  private readonly http: AxiosInstance;
  private readonly logger = new Logger(HttpEvolutionClient.name);

  constructor(
    @Inject("EvolutionConfig")
    private readonly config: EvolutionConfig,
  ) {
    this.http = axios.create({
      baseURL: config.baseUrl,
      headers: {
        apikey: config.apiKey,
      },
      timeout: 10000,
    });

    this.logger.log("Evolution notification provider initialized");
  }

  async sendText(data: SendTextRequest): Promise<void> {
    this.logger.log("Evolution notification delivery started");

    try {
      await this.http.post(`/message/sendText/${data.instance}`, {
        number: data.number,
        text: data.text,
      });
      this.logger.log("Evolution notification delivery completed");
    } catch (error) {
      this.logger.error(this.getSanitizedErrorMessage(error));
      throw error;
    }
  }

  private getSanitizedErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const code = error.code;
      const message = error.message.replace(/https?:\/\/\S+/g, "[url]");

      return `Evolution notification delivery failed${status ? ` (status: ${status})` : ""}${code ? ` (code: ${code})` : ""}: ${message}`;
    }

    return "Evolution notification delivery failed with an unexpected error";
  }
}
