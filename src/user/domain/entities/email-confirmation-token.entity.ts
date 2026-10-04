import { randomUUID } from "node:crypto";

export type EmailConfirmationTokenProps = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class EmailConfirmationToken {
  private constructor(private readonly props: EmailConfirmationTokenProps) {}

  static create(
    userId: string,
    tokenHash: string,
  ): EmailConfirmationToken {
    const now = new Date();

    return new EmailConfirmationToken({
      id: randomUUID(),
      userId,
      tokenHash,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      usedAt: null,
      createdAt: now,
      updatedAt: now,
    });
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

  get usedAt(): Date | null {
    return this.props.usedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
