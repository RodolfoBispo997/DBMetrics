import { randomBytes } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { RefreshSession } from "../../../domain/entities/refresh-session.entity";
import { InvalidRefreshSessionError } from "../../../domain/errors/invalid-refresh-session-error";
import { RefreshSessionRepository } from "../../repositories/refresh-session-repository";
import { REFRESH_TOKEN_TTL_DAYS } from "./refresh-session.constants";

@Injectable()
export class RotateRefreshSessionUseCase {
  constructor(
    @Inject("RefreshSessionRepository")
    private readonly refreshSessionRepository: RefreshSessionRepository,
    @Inject(REFRESH_TOKEN_TTL_DAYS)
    private readonly ttlDays: number,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    currentToken: string | undefined,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!currentToken) {
      throw new InvalidRefreshSessionError();
    }

    const now = new Date();
    const refreshToken = randomBytes(32).toString("base64url");
    const replacementExpiresAt = new Date(
      now.getTime() + this.ttlDays * 24 * 60 * 60 * 1000,
    );
    const user = await this.refreshSessionRepository.rotate(
      RefreshSession.hashToken(currentToken),
      refreshToken,
      replacementExpiresAt,
      now,
    );

    if (!user || user.emailVerifiedAt === null) {
      throw new InvalidRefreshSessionError();
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken, refreshToken };
  }
}
