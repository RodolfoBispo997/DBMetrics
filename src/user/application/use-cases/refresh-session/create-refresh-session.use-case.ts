import { randomBytes } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { RefreshSession } from "../../../domain/entities/refresh-session.entity";
import { RefreshSessionRepository } from "../../repositories/refresh-session-repository";
import { REFRESH_TOKEN_TTL_DAYS } from "./refresh-session.constants";

@Injectable()
export class CreateRefreshSessionUseCase {
  constructor(
    @Inject("RefreshSessionRepository")
    private readonly refreshSessionRepository: RefreshSessionRepository,
    @Inject(REFRESH_TOKEN_TTL_DAYS)
    private readonly ttlDays: number,
  ) {}

  async execute(userId: string): Promise<{ refreshToken: string }> {
    const refreshToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + this.ttlDays * 24 * 60 * 60 * 1000);
    const session = RefreshSession.create(userId, refreshToken, expiresAt);
    await this.refreshSessionRepository.create(session);

    return { refreshToken };
  }
}
