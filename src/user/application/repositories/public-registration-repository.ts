import { EmailConfirmationToken } from "../../domain/entities/email-confirmation-token.entity";
import { User } from "../../domain/entities/user.entity";

export type ActiveEmailConfirmationToken = {
  id: string;
  userId: string;
};

export type PendingVerificationUser = {
  name: string;
  email: string;
};

export interface PublicRegistrationRepository {
  createUserWithConfirmation(
    user: User,
    token: EmailConfirmationToken,
  ): Promise<void>;
  findActiveTokenByHash(
    tokenHash: string,
    now: Date,
  ): Promise<ActiveEmailConfirmationToken | null>;
  confirmEmail(tokenId: string, userId: string, at: Date): Promise<boolean>;
  replacePendingUserConfirmationToken(
    email: string,
    userId: string,
    token: EmailConfirmationToken,
    at: Date,
  ): Promise<PendingVerificationUser | null>;
}
