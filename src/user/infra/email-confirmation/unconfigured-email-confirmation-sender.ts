import { Injectable } from "@nestjs/common";
import {
  EmailConfirmationMessage,
  EmailConfirmationSender,
} from "../../application/use-cases/public-registration/email-confirmation-sender";

@Injectable()
export class UnconfiguredEmailConfirmationSender
  implements EmailConfirmationSender
{
  async send(_message: EmailConfirmationMessage): Promise<void> {
    throw new Error("No email confirmation provider is configured");
  }
}
