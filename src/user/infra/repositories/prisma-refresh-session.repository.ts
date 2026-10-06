import { Injectable } from "@nestjs/common";
import { Prisma } from "../../../../generated/prisma/client";
import { PrismaService } from "../../../shared/infra/database/prisma/prisma.service";
import { User } from "../../domain/entities/user.entity";
import { RefreshSession } from "../../domain/entities/refresh-session.entity";
import { RefreshSessionRepository } from "../../application/repositories/refresh-session-repository";
import { UserRole } from "../../domain/enums/user-role.enum";

@Injectable()
export class PrismaRefreshSessionRepository
  implements RefreshSessionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(session: RefreshSession): Promise<void> {
    await this.prisma.refreshSession.create({
      data: {
        id: session.id,
        userId: session.userId,
        tokenHash: session.tokenHash,
        expiresAt: session.expiresAt,
        revokedAt: session.revokedAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  }

  async rotate(
    currentTokenHash: string,
    replacementToken: string,
    replacementExpiresAt: Date,
    now: Date,
  ): Promise<User | null> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const currentSession = await transaction.refreshSession.findUnique({
            where: { tokenHash: currentTokenHash },
            include: { user: true },
          });

          if (
            !currentSession ||
            currentSession.revokedAt !== null ||
            currentSession.expiresAt <= now ||
            currentSession.user.emailVerifiedAt === null
          ) {
            return null;
          }

          const revoked = await transaction.refreshSession.updateMany({
            where: {
              id: currentSession.id,
              revokedAt: null,
              expiresAt: { gt: now },
            },
            data: { revokedAt: now },
          });
          if (revoked.count !== 1) {
            return null;
          }

          const replacementSession = RefreshSession.create(
            currentSession.userId,
            replacementToken,
            replacementExpiresAt,
          );
          await transaction.refreshSession.create({
            data: {
              id: replacementSession.id,
              userId: replacementSession.userId,
              tokenHash: replacementSession.tokenHash,
              expiresAt: replacementSession.expiresAt,
              revokedAt: replacementSession.revokedAt,
              createdAt: replacementSession.createdAt,
              updatedAt: replacementSession.updatedAt,
            },
          });

          return User.restore({
            id: currentSession.user.id,
            name: currentSession.user.name,
            email: currentSession.user.email,
            password: currentSession.user.password,
            role: currentSession.user.role as UserRole,
            emailVerifiedAt: currentSession.user.emailVerifiedAt,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034"
      ) {
        return null;
      }
      throw error;
    }
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
