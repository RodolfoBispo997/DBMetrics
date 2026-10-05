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

const emailPrefix = `integration-${process.pid}-`;
let prisma: PrismaService;
let userRepository: PrismaUserRepository;
let registrationRepository: PrismaPublicRegistrationRepository;

before(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
  userRepository = new PrismaUserRepository(prisma);
  registrationRepository = new PrismaPublicRegistrationRepository(prisma);
});

beforeEach(async () => {
  await prisma.emailConfirmationToken.deleteMany();
  await prisma.user.deleteMany();
});

afterEach(async () => {
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
