import { Injectable } from "@nestjs/common";
import {
  EmailConfirmationMessage,
  EmailConfirmationSender,
} from "../../application/use-cases/public-registration/email-confirmation-sender";
import { buildEmailConfirmationUrl } from "./email-confirmation-url";

@Injectable()
export class LocalEmailConfirmationSender implements EmailConfirmationSender {
  constructor(private readonly publicWebUrl = "http://localhost:3000") {}

  async send(message: EmailConfirmationMessage): Promise<void> {
    console.info(buildEmailConfirmationUrl(this.publicWebUrl, message.token));
  }
}
