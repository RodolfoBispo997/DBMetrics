import { Injectable } from "@nestjs/common";
import {
  EmailConfirmationMessage,
  EmailConfirmationSender,
} from "../../application/use-cases/public-registration/email-confirmation-sender";

@Injectable()
export class LocalEmailConfirmationSender implements EmailConfirmationSender {
  async send(_message: EmailConfirmationMessage): Promise<void> {
    console.info("Email confirmation created; no email was sent.");
  }
}
