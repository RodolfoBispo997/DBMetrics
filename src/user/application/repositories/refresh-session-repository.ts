import { User } from "../../domain/entities/user.entity";
import { RefreshSession } from "../../domain/entities/refresh-session.entity";

export interface RefreshSessionRepository {
  create(session: RefreshSession): Promise<void>;
  rotate(
    currentTokenHash: string,
    replacementToken: string,
    replacementExpiresAt: Date,
    now: Date,
  ): Promise<User | null>;
  revokeByTokenHash(tokenHash: string): Promise<void>;
}
