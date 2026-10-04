import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { NotFoundException } from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { JwtService } from "@nestjs/jwt";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateUserUseCase } from "../src/user/application/use-cases/create-user/create-user.use-case";
import { AuthenticateUserUseCase } from "../src/user/application/use-cases/authenticate-user/authenticate-user-use-case";
import { User } from "../src/user/domain/entities/user.entity";
import { EmailConfirmationToken } from "../src/user/domain/entities/email-confirmation-token.entity";
import { UserRole } from "../src/user/domain/enums/user-role.enum";
import { EmailAlreadyExistsError } from "../src/user/domain/errors/email-already-exists-error";
import { EmailNotVerifiedError } from "../src/user/domain/errors/email-not-verified-error";
import { InvalidEmailConfirmationTokenError } from "../src/user/domain/errors/invalid-email-confirmation-token-error";
import { InvalidCredentialsError } from "../src/user/domain/errors/invalid-credentials-error";
import { InvalidNameError } from "../src/user/domain/errors/invalid-name-error";
import { RegisterPublicUserUseCase } from "../src/user/application/use-cases/public-registration/register-public-user.use-case";
import { VerifyEmailUseCase } from "../src/user/application/use-cases/public-registration/verify-email.use-case";
import { PublicRegistrationEnabledGuard } from "../src/auth/guards/public-registration-enabled.guard";
import { AuthController } from "../src/auth/auth.controller";
import { PublicRegistrationHttpDTO } from "../src/user/presentation/dto/public-registration-http.dto";
import { LocalEmailConfirmationSender } from "../src/user/infra/email-confirmation/local-email-confirmation-sender";
import { getPublicRegistrationEnabled } from "../src/shared/config/environment.config";

const input = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "plain-password",
};
const makeUser = (role = UserRole.ADMIN) =>
  User.restore({
    id: "00000000-0000-4000-8000-000000000001",
    ...input,
    password: "hashed-password",
    role,
    emailVerifiedAt: new Date(),
  });

test("User.restore normalizes a missing emailVerifiedAt to null", () => {
  const restored = Reflect.apply(User.restore, User, [
    {
      id: "00000000-0000-4000-8000-000000000002",
      name: input.name,
      email: input.email,
      password: "hashed-password",
      role: UserRole.MEMBER,
    },
  ]);

  assert.equal(restored.emailVerifiedAt, null);
});

test("CreateUserUseCase hashes and persists a new user without exposing password", async () => {
  let saved: User | undefined;
  const hashes: string[] = [];
  const useCase = new CreateUserUseCase(
    {
      findByEmail: async () => null,
      findById: async () => null,
      save: async (user) => {
        saved = user;
      },
    },
    {
      hash: async (password) => {
        hashes.push(password);
        return "hashed-password";
      },
    },
  );

  const result = await useCase.execute(input);
  assert.deepEqual(hashes, [input.password]);
  assert.equal(saved?.password, "hashed-password");
  assert.equal(result.role, UserRole.ADMIN);
  assert.deepEqual(Object.keys(result).sort(), ["email", "id", "name", "role"]);
});

test("CreateUserUseCase preserves an explicit role and rejects duplicates before hashing", async () => {
  let hashed = false;
  let authorizedSaveCalls = 0;
  let duplicateSaveCalls = 0;
  const create = new CreateUserUseCase(
    {
      findByEmail: async () => null,
      findById: async () => null,
      save: async () => {
        authorizedSaveCalls++;
      },
    },
    { hash: async () => "hashed-password" },
  );
  assert.equal(
    (await create.execute({ ...input, role: UserRole.VIEWER })).role,
    UserRole.VIEWER,
  );
  const duplicate = new CreateUserUseCase(
    {
      findByEmail: async () => makeUser(),
      findById: async () => null,
      save: async () => {
        duplicateSaveCalls++;
      },
    },
    {
      hash: async () => {
        hashed = true;
        return "hash";
      },
    },
  );
  await assert.rejects(() => duplicate.execute(input), EmailAlreadyExistsError);
  assert.equal(hashed, false);
  assert.equal(authorizedSaveCalls, 1);
  assert.equal(duplicateSaveCalls, 0);
});

test("CreateUserUseCase propagates entity validation failures", async () => {
  const useCase = new CreateUserUseCase(
    {
      findByEmail: async () => null,
      findById: async () => null,
      save: async () => undefined,
    },
    { hash: async () => "hash" },
  );
  await assert.rejects(
    () => useCase.execute({ ...input, name: "x" }),
    InvalidNameError,
  );
});

test("AuthenticateUserUseCase compares the persisted hash and signs the exact safe payload", async () => {
  const compared: string[][] = [];
  let payload: unknown;
  const useCase = new AuthenticateUserUseCase(
    {
      findByEmail: async () => makeUser(UserRole.MEMBER),
      findById: async () => null,
      save: async () => undefined,
    },
    {
      compare: async (value, hash) => {
        compared.push([value, hash]);
        return true;
      },
    },
    {
      signAsync: async (value: unknown) => {
        payload = value;
        return "token";
      },
    } as JwtService,
  );
  assert.deepEqual(
    await useCase.execute({ email: input.email, password: input.password }),
    { accessToken: "token" },
  );
  assert.deepEqual(compared, [[input.password, "hashed-password"]]);
  assert.deepEqual(payload, {
    sub: "00000000-0000-4000-8000-000000000001",
    email: input.email,
    role: UserRole.MEMBER,
  });
});

test("AuthenticateUserUseCase uses one indistinguishable error and never signs invalid credentials", async () => {
  for (const user of [null, makeUser()]) {
    let signed = false;
    const useCase = new AuthenticateUserUseCase(
      {
        findByEmail: async () => user,
        findById: async () => null,
        save: async () => undefined,
      },
      { compare: async () => false },
      {
        signAsync: async () => {
          signed = true;
          return "token";
        },
      } as JwtService,
    );
    await assert.rejects(
      () => useCase.execute({ email: input.email, password: "wrong" }),
      InvalidCredentialsError,
    );
    assert.equal(signed, false);
  }
});

test("public registration creates only an unverified MEMBER and exposes no password or token", async () => {
  let persistedUser: User | undefined;
  let persistedToken: EmailConfirmationToken | undefined;
  let deliveredToken = "";
  let lookupEmail = "";
  const useCase = new RegisterPublicUserUseCase(
    {
      findByEmail: async (email) => {
        lookupEmail = email;
        return null;
      },
      findById: async () => null,
      save: async () => undefined,
    },
    {
      createUserWithConfirmation: async (user, token) => {
        persistedUser = user;
        persistedToken = token;
      },
      findActiveTokenByHash: async () => null,
      confirmEmail: async () => false,
    },
    { hash: async () => "hashed-password" },
    {
      send: async ({ token }) => {
        deliveredToken = token;
      },
    },
  );

  const inputWithRole = {
    ...input,
    email: " ADA@Example.com ",
    role: UserRole.ADMIN,
  };
  const result = await useCase.execute(inputWithRole);

  assert.equal(lookupEmail, "ada@example.com");
  assert.equal(persistedUser?.email, "ada@example.com");
  assert.equal(persistedUser?.password, "hashed-password");
  assert.equal(persistedUser?.role, UserRole.MEMBER);
  assert.equal(persistedUser?.emailVerifiedAt, null);
  assert.equal(persistedToken?.userId, persistedUser?.id);
  assert.equal(
    persistedToken?.tokenHash,
    createHash("sha256").update(deliveredToken).digest("hex"),
  );
  assert.notEqual(persistedToken?.tokenHash, deliveredToken);
  assert.equal(
    persistedToken?.expiresAt.getTime()! - persistedToken?.createdAt.getTime()!,
    24 * 60 * 60 * 1000,
  );
  assert.deepEqual(result, {
    id: persistedUser?.id,
    name: "Ada Lovelace",
    email: "ada@example.com",
    role: UserRole.MEMBER,
  });
  assert.equal("password" in result, false);
  assert.equal("token" in result, false);
});

test("public registration DTO rejects a role field", async () => {
  const dto = plainToInstance(PublicRegistrationHttpDTO, {
    ...input,
    role: UserRole.ADMIN,
  });
  const errors = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  assert.ok(errors.some((error) => error.property === "role"));
});

test("public registration rejects normalized duplicate emails before hashing", async () => {
  let hashed = false;
  const useCase = new RegisterPublicUserUseCase(
    {
      findByEmail: async (email) => {
        assert.equal(email, "ada@example.com");
        return makeUser();
      },
      findById: async () => null,
      save: async () => undefined,
    },
    {
      createUserWithConfirmation: async () => {
        assert.fail("duplicate registration must not be persisted");
      },
      findActiveTokenByHash: async () => null,
      confirmEmail: async () => false,
    },
    {
      hash: async () => {
        hashed = true;
        return "hash";
      },
    },
    { send: async () => undefined },
  );

  await assert.rejects(
    () => useCase.execute({ ...input, email: " ADA@EXAMPLE.COM " }),
    EmailAlreadyExistsError,
  );
  assert.equal(hashed, false);
});

test("valid email confirmation verifies the account and makes its token unusable", async () => {
  const rawToken = "one-time-confirmation-token";
  const tokenId = "token-id";
  const userId = "user-id";
  let consumed = false;
  let verifiedAt: Date | null = null;
  const repository = {
    createUserWithConfirmation: async () => undefined,
    findActiveTokenByHash: async (hash: string) =>
      hash === createHash("sha256").update(rawToken).digest("hex") && !consumed
        ? { id: tokenId, userId }
        : null,
    confirmEmail: async (id: string, idOfUser: string, at: Date) => {
      if (id !== tokenId || idOfUser !== userId || consumed) {
        return false;
      }
      consumed = true;
      verifiedAt = at;
      return true;
    },
  };
  const useCase = new VerifyEmailUseCase(repository);

  assert.deepEqual(await useCase.execute({ token: rawToken }), { verified: true });
  assert.ok(verifiedAt instanceof Date);
  await assert.rejects(
    () => useCase.execute({ token: rawToken }),
    InvalidEmailConfirmationTokenError,
  );
});

test("email confirmation rejects expired, used, nonexistent, and altered tokens", async () => {
  const storedToken = "stored-confirmation-token";
  const rawHash = createHash("sha256").update(storedToken).digest("hex");

  for (const state of ["expired", "used", "missing", "altered"] as const) {
    const record =
      state === "missing"
        ? null
        : {
            id: "token-id",
            userId: "user-id",
            tokenHash: rawHash,
            expiresAt:
              state === "expired"
                ? new Date(Date.now() - 1000)
                : new Date(Date.now() + 1000),
            usedAt: state === "used" ? new Date() : null,
          };
    const useCase = new VerifyEmailUseCase({
      createUserWithConfirmation: async () => undefined,
      findActiveTokenByHash: async (tokenHash, now) =>
        record &&
        record.tokenHash === tokenHash &&
        record.usedAt === null &&
        record.expiresAt > now
          ? { id: record.id, userId: record.userId }
          : null,
      confirmEmail: async () => {
        assert.fail(`a ${state} token must not be confirmed`);
      },
    });
    const suppliedToken =
      state === "altered" ? "altered-confirmation-token" : storedToken;
    await assert.rejects(
      () => useCase.execute({ token: suppliedToken }),
      InvalidEmailConfirmationTokenError,
    );
  }
});

test("login blocks correct credentials for unverified users without signing an access token", async () => {
  const unverifiedUser = User.restore({
    id: "00000000-0000-4000-8000-000000000001",
    name: input.name,
    email: input.email,
    password: "hashed-password",
    role: UserRole.MEMBER,
    emailVerifiedAt: null,
  });
  let signed = false;
  const useCase = new AuthenticateUserUseCase(
    {
      findByEmail: async () => unverifiedUser,
      findById: async () => null,
      save: async () => undefined,
    },
    { compare: async () => true },
    {
      signAsync: async () => {
        signed = true;
        return "token";
      },
    } as JwtService,
  );

  await assert.rejects(
    () => useCase.execute({ email: input.email, password: input.password }),
    EmailNotVerifiedError,
  );
  assert.equal(signed, false);
});

test("public registration guard returns 404 when disabled", async () => {
  const priorValue = process.env.PUBLIC_REGISTRATION_ENABLED;
  process.env.PUBLIC_REGISTRATION_ENABLED = "false";

  try {
    assert.throws(
      () => new PublicRegistrationEnabledGuard().canActivate(),
      NotFoundException,
    );
  } finally {
    if (priorValue === undefined) {
      delete process.env.PUBLIC_REGISTRATION_ENABLED;
    } else {
      process.env.PUBLIC_REGISTRATION_ENABLED = priorValue;
    }
  }
});

test("verify-email endpoint uses the registration guard and returns 404 before its use case", async () => {
  const priorValue = process.env.PUBLIC_REGISTRATION_ENABLED;

  try {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      AuthController.prototype.verifyEmail,
    ) as unknown[];
    assert.ok(guards.includes(PublicRegistrationEnabledGuard));

    for (const value of ["false", undefined]) {
      if (value === undefined) {
        delete process.env.PUBLIC_REGISTRATION_ENABLED;
      } else {
        process.env.PUBLIC_REGISTRATION_ENABLED = value;
      }

      assert.throws(
        () => new PublicRegistrationEnabledGuard().canActivate(),
        NotFoundException,
      );
    }
  } finally {
    if (priorValue === undefined) {
      delete process.env.PUBLIC_REGISTRATION_ENABLED;
    } else {
      process.env.PUBLIC_REGISTRATION_ENABLED = priorValue;
    }
  }
});

test("public registration defaults to disabled when the environment variable is absent", () => {
  const priorValue = process.env.PUBLIC_REGISTRATION_ENABLED;
  delete process.env.PUBLIC_REGISTRATION_ENABLED;

  try {
    assert.equal(getPublicRegistrationEnabled(), false);
  } finally {
    if (priorValue !== undefined) {
      process.env.PUBLIC_REGISTRATION_ENABLED = priorValue;
    }
  }
});

test("public registration cannot be enabled outside development without a provider", () => {
  const priorEnabled = process.env.PUBLIC_REGISTRATION_ENABLED;
  const priorNodeEnv = process.env.NODE_ENV;
  process.env.PUBLIC_REGISTRATION_ENABLED = "true";
  process.env.NODE_ENV = "production";

  try {
    assert.throws(
      () => getPublicRegistrationEnabled(),
      /requires a real email confirmation provider/,
    );
  } finally {
    if (priorEnabled === undefined) {
      delete process.env.PUBLIC_REGISTRATION_ENABLED;
    } else {
      process.env.PUBLIC_REGISTRATION_ENABLED = priorEnabled;
    }
    if (priorNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = priorNodeEnv;
    }
  }
});

test("local confirmation sender logs no email address or raw token", async () => {
  const priorInfo = console.info;
  const logged: unknown[][] = [];
  console.info = (...args: unknown[]) => {
    logged.push(args);
  };

  try {
    await new LocalEmailConfirmationSender().send({
      email: "private@example.com",
      name: "Private User",
      token: "raw-secret-token",
    });
  } finally {
    console.info = priorInfo;
  }

  assert.equal(JSON.stringify(logged).includes("private@example.com"), false);
  assert.equal(JSON.stringify(logged).includes("raw-secret-token"), false);
});
