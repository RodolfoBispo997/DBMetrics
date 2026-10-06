import { Injectable, Inject } from "@nestjs/common";
import { RefreshSession } from "../../../domain/entities/refresh-session.entity";
import { RefreshSessionRepository } from "../../repositories/refresh-session-repository";

@Injectable()
export class LogoutRefreshSessionUseCase {
  constructor(
    @Inject("RefreshSessionRepository")
    private readonly refreshSessionRepository: RefreshSessionRepository,
  ) {}

  async execute(refreshToken: string | undefined): Promise<void> {
    if (refreshToken) {
      await this.refreshSessionRepository.revokeByTokenHash(
        RefreshSession.hashToken(refreshToken),
      );
    }
  }
}
