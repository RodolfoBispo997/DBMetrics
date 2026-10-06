import assert from "node:assert/strict";
import test from "node:test";
import { JwtService } from "@nestjs/jwt";
import { User } from "../src/user/domain/entities/user.entity";
import { RefreshSession } from "../src/user/domain/entities/refresh-session.entity";
import { UserRole } from "../src/user/domain/enums/user-role.enum";
import { InvalidRefreshSessionError } from "../src/user/domain/errors/invalid-refresh-session-error";
import { RefreshSessionRepository } from "../src/user/application/repositories/refresh-session-repository";
import { CreateRefreshSessionUseCase } from "../src/user/application/use-cases/refresh-session/create-refresh-session.use-case";
import { LogoutRefreshSessionUseCase } from "../src/user/application/use-cases/refresh-session/logout-refresh-session.use-case";
import { RotateRefreshSessionUseCase } from "../src/user/application/use-cases/refresh-session/rotate-refresh-session.use-case";
import { getRefreshTokenTtlDays } from "../src/shared/config/environment.config";
import { getRefreshSessionCookieOptions } from "../src/auth/refresh-session-cookie";

const verifiedUser = User.restore({
  id: "00000000-0000-4000-8000-000000000001",
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "hashed-password",
  role: UserRole.MEMBER,
  emailVerifiedAt: new Date(),
});

test("refresh session creation persists only the hash of a high-entropy token", async () => {
  let persistedSession: RefreshSession | undefined;
  const useCase = new CreateRefreshSessionUseCase(
    {
      create: async (session) => {
        persistedSession = session;
      },
    } as RefreshSessionRepository,
    30,
  );

  const result = await useCase.execute(verifiedUser.id);

  assert.ok(result.refreshToken.length >= 43);
  assert.equal(persistedSession?.userId, verifiedUser.id);
  assert.equal(
    persistedSession?.tokenHash,
    RefreshSession.hashToken(result.refreshToken),
  );
  assert.notEqual(persistedSession?.tokenHash, result.refreshToken);
  assert.equal(persistedSession?.tokenHash.length, 64);
});

test("rotation invalidates the previous token and refuses to reuse it", async () => {
  let activeTokenHash = RefreshSession.hashToken("original-refresh-token");
  let rotated = false;
  const repository: RefreshSessionRepository = {
    create: async () => undefined,
    rotate: async (currentHash, replacementToken) => {
      if (currentHash !== activeTokenHash || rotated) {
        return null;
      }
      activeTokenHash = RefreshSession.hashToken(replacementToken);
      rotated = true;
      return verifiedUser;
    },
    revokeByTokenHash: async () => undefined,
  };
  const useCase = new RotateRefreshSessionUseCase(
    repository,
    30,
    { signAsync: async () => "new-access-token" } as JwtService,
  );

  const rotatedSession = await useCase.execute("original-refresh-token");
  assert.equal(rotatedSession.accessToken, "new-access-token");
  assert.equal(rotatedSession.refreshToken.length >= 43, true);
  await assert.rejects(
    () => useCase.execute("original-refresh-token"),
    InvalidRefreshSessionError,
  );
});

test("expired, revoked, or missing refresh sessions fail with the same generic unauthorized error", async () => {
  const repository: RefreshSessionRepository = {
    create: async () => undefined,
    rotate: async () => null,
    revokeByTokenHash: async () => undefined,
  };
  const useCase = new RotateRefreshSessionUseCase(
    repository,
    30,
    { signAsync: async () => "unused" } as JwtService,
  );

  for (const token of ["expired-token", "revoked-token", "unknown-token"]) {
    await assert.rejects(
      () => useCase.execute(token),
      (error: unknown) =>
        error instanceof InvalidRefreshSessionError &&
        error.statusCode === 401 &&
        error.message === "Invalid refresh session",
    );
  }
  await assert.rejects(
    () => useCase.execute(undefined),
    InvalidRefreshSessionError,
  );
});

test("logout is idempotent for missing and repeated refresh tokens", async () => {
  const revokedHashes: string[] = [];
  const useCase = new LogoutRefreshSessionUseCase({
    create: async () => undefined,
    rotate: async () => null,
    revokeByTokenHash: async (hash) => {
      revokedHashes.push(hash);
    },
  });

  await useCase.execute(undefined);
  await useCase.execute("logout-token");
  await useCase.execute("logout-token");

  assert.deepEqual(revokedHashes, [
    RefreshSession.hashToken("logout-token"),
    RefreshSession.hashToken("logout-token"),
  ]);
});

test("refresh token TTL defaults to 30 days and accepts only positive integers", () => {
  const previousValue = process.env.REFRESH_TOKEN_TTL_DAYS;

  try {
    delete process.env.REFRESH_TOKEN_TTL_DAYS;
    assert.equal(getRefreshTokenTtlDays(), 30);
    process.env.REFRESH_TOKEN_TTL_DAYS = "45";
    assert.equal(getRefreshTokenTtlDays(), 45);

    for (const invalidValue of ["0", "-1", "1.5", "never"]) {
      process.env.REFRESH_TOKEN_TTL_DAYS = invalidValue;
      assert.throws(
        () => getRefreshTokenTtlDays(),
        /REFRESH_TOKEN_TTL_DAYS must be an integer greater than zero/,
      );
    }
  } finally {
    if (previousValue === undefined) {
      delete process.env.REFRESH_TOKEN_TTL_DAYS;
    } else {
      process.env.REFRESH_TOKEN_TTL_DAYS = previousValue;
    }
  }
});

test("refresh cookie options use the required scope and production security", () => {
  const productionOptions = getRefreshSessionCookieOptions(30, "production");
  assert.equal(productionOptions.httpOnly, true);
  assert.equal(productionOptions.sameSite, "lax");
  assert.equal(productionOptions.secure, true);
  assert.equal(productionOptions.path, "/auth");
  assert.equal(productionOptions.maxAge, 30 * 24 * 60 * 60 * 1000);
  assert.equal(getRefreshSessionCookieOptions(30, "test").secure, false);
  assert.equal(getRefreshSessionCookieOptions(30, "development").secure, false);
});
