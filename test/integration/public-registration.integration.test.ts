import assert from "node:assert/strict";
import test, { after, afterEach, before, beforeEach } from "node:test";
import { createHash } from "node:crypto";
import { PrismaPublicRegistrationRepository } from "../../src/user/infra/repositories/prisma-public-registration.repository";
import { PrismaUserRepository } from "../../src/user/infra/repositories/prisma-user.repository";
import { PrismaService } from "../../src/shared/infra/database/prisma/prisma.service";
import { RegisterPublicUserUseCase } from "../../src/user/application/use-cases/public-registration/register-public-user.use-case";
import { VerifyEmailUseCase } from "../../src/user/application/use-cases/public-registration/verify-email.use-case";
import { ResendVerificationUseCase } from "../../src/user/application/use-cases/public-registration/resend-verification.use-case";
import { EmailConfirmationToken } from "../../src/user/domain/entities/email-confirmation-token.entity";
import { User } from "../../src/user/domain/entities/user.entity";
import { UserRole } from "../../src/user/domain/enums/user-role.enum";
import { InvalidEmailConfirmationTokenError } from "../../src/user/domain/errors/invalid-email-confirmation-token-error";
import { PrismaRefreshSessionRepository } from "../../src/user/infra/repositories/prisma-refresh-session.repository";
import { CreateRefreshSessionUseCase } from "../../src/user/application/use-cases/refresh-session/create-refresh-session.use-case";
import { RotateRefreshSessionUseCase } from "../../src/user/application/use-cases/refresh-session/rotate-refresh-session.use-case";
import { RefreshSession } from "../../src/user/domain/entities/refresh-session.entity";
import { InvalidRefreshSessionError } from "../../src/user/domain/errors/invalid-refresh-session-error";
import type { User as PrismaUser } from "../../generated/prisma/client";
import type { JwtService } from "@nestjs/jwt";

const emailPrefix = `integration-${process.pid}-`;
let prisma: PrismaService;
let userRepository: PrismaUserRepository;
let registrationRepository: PrismaPublicRegistrationRepository;
let refreshSessionRepository: PrismaRefreshSessionRepository;

before(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
  userRepository = new PrismaUserRepository(prisma);
  registrationRepository = new PrismaPublicRegistrationRepository(prisma);
  refreshSessionRepository = new PrismaRefreshSessionRepository(prisma);
});

beforeEach(async () => {
  await prisma.refreshSession.deleteMany();
  await prisma.emailConfirmationToken.deleteMany();
  await prisma.user.deleteMany();
});

afterEach(async () => {
  await prisma.refreshSession.deleteMany();
  await prisma.emailConfirmationToken.deleteMany();
  await prisma.user.deleteMany();
});

after(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

function createRegistrationUseCase(deliveredTokens: string[]) {
  return new RegisterPublicUserUseCase(
    userRepository,
    registrationRepository,
    { hash: async (value) => `integration-hash:${value}` },
    { send: async ({ token }) => void deliveredTokens.push(token) },
  );
}

async function createVerifiedPrismaUser(email: string): Promise<PrismaUser> {
  return prisma.user.create({
    data: {
      name: "Refresh Integration User",
      email,
      password: "hashed-integration-password",
      role: UserRole.MEMBER,
      emailVerifiedAt: new Date(),
    },
  });
}

function createRefreshUseCases() {
  return {
    create: new CreateRefreshSessionUseCase(refreshSessionRepository, 30),
    rotate: new RotateRefreshSessionUseCase(
      refreshSessionRepository,
      30,
      { signAsync: async () => "integration-access-token" } as JwtService,
    ),
  };
}

test("persists a pending user and only the hash of its confirmation token", async () => {
  const deliveredTokens: string[] = [];
  const email = `${emailPrefix}pending@example.com`;
  await createRegistrationUseCase(deliveredTokens).execute({
    name: "Integration User",
    email,
    password: "integration-password",
  });

  const persistedUser = await prisma.user.findUnique({ where: { email } });
  assert.ok(persistedUser, "expected the pending user to be persisted");
  const persistedTokens = await prisma.emailConfirmationToken.findMany({
    where: { userId: persistedUser.id },
  });

  assert.equal(persistedUser?.emailVerifiedAt, null);
  assert.equal(persistedUser?.role, UserRole.MEMBER);
  assert.equal(persistedTokens.length, 1);
  assert.equal(persistedTokens[0].userId, persistedUser.id);
  assert.equal(persistedTokens[0].tokenHash, createHash("sha256").update(deliveredTokens[0]).digest("hex"));
  assert.notEqual(persistedTokens[0].tokenHash, deliveredTokens[0]);
});

test("confirms a real persisted account once and rejects confirmation token reuse", async () => {
  const deliveredTokens: string[] = [];
  const email = `${emailPrefix}confirm@example.com`;
  await createRegistrationUseCase(deliveredTokens).execute({
    name: "Confirm User",
    email,
    password: "integration-password",
  });
  const verifyUseCase = new VerifyEmailUseCase(registrationRepository);

  assert.deepEqual(
    await verifyUseCase.execute({ token: deliveredTokens[0] }),
    { verified: true },
  );
  const verifiedUser = await prisma.user.findUnique({
    where: { email },
  });
  const token = await prisma.emailConfirmationToken.findUnique({
    where: {
      tokenHash: createHash("sha256").update(deliveredTokens[0]).digest("hex"),
    },
  });

  assert.ok(verifiedUser?.emailVerifiedAt instanceof Date);
  assert.ok(token?.usedAt instanceof Date);
  await assert.rejects(
    () => verifyUseCase.execute({ token: deliveredTokens[0] }),
    InvalidEmailConfirmationTokenError,
  );
});

test("resending invalidates the previous active token in PostgreSQL", async () => {
  const deliveredTokens: string[] = [];
  const email = `${emailPrefix}resend@example.com`;
  await createRegistrationUseCase(deliveredTokens).execute({
    name: "Resend User",
    email,
    password: "integration-password",
  });
  const previousToken = deliveredTokens[0];
  const resendUseCase = new ResendVerificationUseCase(
    userRepository,
    registrationRepository,
    { send: async ({ token }) => void deliveredTokens.push(token) },
  );

  assert.equal(
    (
      await resendUseCase.execute({ email: email.toUpperCase() })
    ).message.includes("confirmation email"),
    true,
  );
  assert.equal(deliveredTokens.length, 2);

  const previousHash = createHash("sha256").update(previousToken).digest("hex");
  const newHash = createHash("sha256").update(deliveredTokens[1]).digest("hex");
  const previousPersistedToken = await prisma.emailConfirmationToken.findUnique({
    where: { tokenHash: previousHash },
  });
  const replacement = await registrationRepository.findActiveTokenByHash(
    newHash,
    new Date(),
  );

  assert.ok(previousPersistedToken?.usedAt instanceof Date);
  assert.equal(
    await registrationRepository.findActiveTokenByHash(previousHash, new Date()),
    null,
  );
  assert.ok(replacement);
  assert.equal(replacement.userId, (await prisma.user.findUniqueOrThrow({ where: { email } })).id);
});

test("PostgreSQL enforces unique user email values", async () => {
  const email = `${emailPrefix}unique@example.com`;
  const first = User.create({
    name: "Unique User",
    email,
    password: "hashed-integration-password",
    role: UserRole.MEMBER,
    emailVerifiedAt: null,
  });
  await registrationRepository.createUserWithConfirmation(
    first,
    EmailConfirmationToken.create(first.id, "first-token-hash"),
  );

  const duplicate = User.create({
    name: "Duplicate User",
    email,
    password: "hashed-integration-password",
    role: UserRole.MEMBER,
    emailVerifiedAt: null,
  });

  await assert.rejects(
    () =>
      registrationRepository.createUserWithConfirmation(
        duplicate,
        EmailConfirmationToken.create(duplicate.id, "second-token-hash"),
      ),
    (error: unknown) =>
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002",
  );
});

test("PostgreSQL enforces refresh token hash uniqueness and rotates in one transaction", async () => {
  const user = await createVerifiedPrismaUser(
    `${emailPrefix}refresh@example.com`,
  );
  const { create, rotate } = createRefreshUseCases();
  const { refreshToken } = await create.execute(user.id);
  const tokenHash = RefreshSession.hashToken(refreshToken);
  const stored = await prisma.refreshSession.findUnique({
    where: { tokenHash },
  });
  assert.ok(stored);
  assert.equal(stored.userId, user.id);
  assert.notEqual(stored.tokenHash, refreshToken);

  await assert.rejects(
    () =>
      refreshSessionRepository.create(
        RefreshSession.create(
          user.id,
          refreshToken,
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ),
      ),
    (error: unknown) =>
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002",
  );

  const rotated = await rotate.execute(refreshToken);
  assert.equal(rotated.accessToken, "integration-access-token");
  const priorSession = await prisma.refreshSession.findUnique({
    where: { tokenHash },
  });
  const replacement = await prisma.refreshSession.findUnique({
    where: { tokenHash: RefreshSession.hashToken(rotated.refreshToken) },
  });
  assert.ok(priorSession?.revokedAt instanceof Date);
  assert.ok(replacement);
  assert.equal(replacement.userId, user.id);
  await assert.rejects(() => rotate.execute(refreshToken), InvalidRefreshSessionError);
});

test("concurrent refresh attempts with the same token allow only one rotation", async () => {
  const user = await createVerifiedPrismaUser(
    `${emailPrefix}concurrent-refresh@example.com`,
  );
  const { create, rotate } = createRefreshUseCases();
  const { refreshToken } = await create.execute(user.id);

  const results = await Promise.allSettled([
    rotate.execute(refreshToken),
    rotate.execute(refreshToken),
  ]);

  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(
    results.filter((result) => result.status === "rejected").length,
    1,
  );
  const rejected = results.find(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  assert.ok(rejected?.reason instanceof InvalidRefreshSessionError);
  assert.equal(await prisma.refreshSession.count({ where: { userId: user.id } }), 2);
});

test("PostgreSQL rejects expired and revoked refresh sessions generically", async () => {
  const user = await createVerifiedPrismaUser(
    `${emailPrefix}inactive-refresh@example.com`,
  );
  const { create, rotate } = createRefreshUseCases();
  const expired = await create.execute(user.id);
  const expiredHash = RefreshSession.hashToken(expired.refreshToken);
  await prisma.refreshSession.update({
    where: { tokenHash: expiredHash },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });

  await assert.rejects(
    () => rotate.execute(expired.refreshToken),
    InvalidRefreshSessionError,
  );

  const revoked = await create.execute(user.id);
  const revokedHash = RefreshSession.hashToken(revoked.refreshToken);
  await prisma.refreshSession.update({
    where: { tokenHash: revokedHash },
    data: { revokedAt: new Date() },
  });
  await assert.rejects(
    () => rotate.execute(revoked.refreshToken),
    InvalidRefreshSessionError,
  );
});

test("deleting a user cascades to their refresh sessions", async () => {
  const user = await createVerifiedPrismaUser(
    `${emailPrefix}cascade-refresh@example.com`,
  );
  const { refreshToken } = await createRefreshUseCases().create.execute(user.id);
  const tokenHash = RefreshSession.hashToken(refreshToken);

  await prisma.user.delete({ where: { id: user.id } });

  assert.equal(
    await prisma.refreshSession.findUnique({ where: { tokenHash } }),
    null,
  );
});
