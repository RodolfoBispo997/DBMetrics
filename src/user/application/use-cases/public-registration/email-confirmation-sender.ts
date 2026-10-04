export type EmailConfirmationMessage = {
  email: string;
  name: string;
  token: string;
};

export interface EmailConfirmationSender {
  send(message: EmailConfirmationMessage): Promise<void>;
}

export const EMAIL_CONFIRMATION_SENDER = "EmailConfirmationSender";
