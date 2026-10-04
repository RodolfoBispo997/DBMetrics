import { Injectable } from "@nestjs/common";
import { UserRole } from "../../domain/enums/user-role.enum";
import { EmailConfirmationToken } from "../../domain/entities/email-confirmation-token.entity";
import { User } from "../../domain/entities/user.entity";
import { PublicRegistrationRepository } from "../../application/repositories/public-registration-repository";
import { PrismaService } from "../../../shared/infra/database/prisma/prisma.service";

@Injectable()
export class PrismaPublicRegistrationRepository
  implements PublicRegistrationRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async createUserWithConfirmation(
    user: User,
    token: EmailConfirmationToken,
  ): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          role: UserRole.MEMBER,
          emailVerifiedAt: null,
        },
      });

      await transaction.emailConfirmationToken.create({
        data: {
          id: token.id,
          userId: token.userId,
          tokenHash: token.tokenHash,
          expiresAt: token.expiresAt,
          usedAt: token.usedAt,
          createdAt: token.createdAt,
          updatedAt: token.updatedAt,
        },
      });
    });
  }

  async findActiveTokenByHash(
    tokenHash: string,
    now: Date,
  ): Promise<{ id: string; userId: string } | null> {
    return this.prisma.emailConfirmationToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
      select: { id: true, userId: true },
    });
  }

  async confirmEmail(
    tokenId: string,
    userId: string,
    at: Date,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (transaction) => {
      const tokenUpdate = await transaction.emailConfirmationToken.updateMany({
        where: {
          id: tokenId,
          userId,
          usedAt: null,
          expiresAt: { gt: at },
        },
        data: { usedAt: at, updatedAt: at },
      });

      if (tokenUpdate.count !== 1) {
        return false;
      }

      await transaction.user.update({
        where: { id: userId },
        data: { emailVerifiedAt: at },
      });

      return true;
    });
  }
}
