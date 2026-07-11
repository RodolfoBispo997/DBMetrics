import axios, { AxiosInstance } from "axios";
import { Inject, Injectable } from "@nestjs/common";
import {
  EvolutionClient,
  SendTextRequest,
} from "./interfaces/evolution-client.interface";
import { EvolutionConfig } from "./evolution.config";

@Injectable()
export class HttpEvolutionClient implements EvolutionClient {
  private readonly http: AxiosInstance;

  constructor(
    @Inject("EvolutionConfig")
    private readonly config: EvolutionConfig,
  ) {
    console.log("==============================");
    console.log(config);
    console.log("==============================");
    this.http = axios.create({
      baseURL: config.baseUrl,
      headers: {
        apikey: config.apiKey,
      },
      timeout: 10000,
    });
  }

  async sendText(data: SendTextRequest): Promise<void> {
    console.log("BaseURL:", this.http.defaults.baseURL);
    console.log("Payload:", data);
    await this.http.post(`/message/sendText/${data.instance}`, {
      number: data.number,
      text: data.text,
    });
  }
}
