import { createHash, randomUUID } from "node:crypto";

export type RefreshSessionProps = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class RefreshSession {
  private constructor(private readonly props: RefreshSessionProps) {}

  static create(userId: string, rawToken: string, expiresAt: Date): RefreshSession {
    return new RefreshSession({
      id: randomUUID(),
      userId,
      tokenHash: RefreshSession.hashToken(rawToken),
      expiresAt,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: RefreshSessionProps): RefreshSession {
    return new RefreshSession(props);
  }

  static hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get revokedAt(): Date | null {
    return this.props.revokedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
