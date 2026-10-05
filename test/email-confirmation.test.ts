import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { ServiceUnavailableException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ResendVerificationUseCase } from "../src/user/application/use-cases/public-registration/resend-verification.use-case";
import { PublicRegistrationRepository } from "../src/user/application/repositories/public-registration-repository";
import { UserRepository } from "../src/user/application/repositories/user-repository";
import { EmailConfirmationToken } from "../src/user/domain/entities/email-confirmation-token.entity";
import { User } from "../src/user/domain/entities/user.entity";
import { UserRole } from "../src/user/domain/enums/user-role.enum";
import { ResendEmailConfirmationSender, ResendEmailClient } from "../src/user/infra/email-confirmation/resend-email-confirmation-sender";
import { buildEmailConfirmationUrl } from "../src/user/infra/email-confirmation/email-confirmation-url";
import { getPublicRegistrationEnabled } from "../src/shared/config/environment.config";
import { PrismaPublicRegistrationRepository } from "../src/user/infra/repositories/prisma-public-registration.repository";
import { PrismaService } from "../src/shared/infra/database/prisma/prisma.service";
import { ResendVerificationHttpDTO } from "../src/user/presentation/dto/resend-verification-http.dto";

const pendingUser = () =>
  User.restore({
    id: "00000000-0000-4000-8000-000000000010",
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "hashed-password",
    role: UserRole.MEMBER,
    emailVerifiedAt: null,
  });

const verifiedUser = () =>
  User.restore({
    id: "00000000-0000-4000-8000-000000000011",
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "hashed-password",
    role: UserRole.MEMBER,
    emailVerifiedAt: new Date(),
  });

const publicRegistrationRepository = (
  replacePendingUserConfirmationToken: PublicRegistrationRepository["replacePendingUserConfirmationToken"],
): PublicRegistrationRepository => ({
  createUserWithConfirmation: async () => undefined,
  findActiveTokenByHash: async () => null,
  confirmEmail: async () => false,
  replacePendingUserConfirmationToken,
});

const userRepository = (user: User | null): UserRepository => ({
  findByEmail: async () => user,
  findById: async () => null,
  save: async () => undefined,
});

const genericResponse = {
  message:
    "If the account is pending verification, a confirmation email will be sent shortly.",
};

test("Resend sender sends HTML and text with the frontend confirmation URL using a mocked client", async () => {
  let sentMessage:
    | {
        from: string;
        to: string;
        subject: string;
        html: string;
        text: string;
      }
    | undefined;
  const mockedClient: ResendEmailClient = {
    emails: {
      send: async (message) => {
        sentMessage = message;
        return { error: null };
      },
    },
  };
  const sender = new ResendEmailConfirmationSender(
    mockedClient,
    "DBMetrics <no-reply@example.com>",
    "https://app.example.com/",
  );

  await sender.send({
    email: "ada@example.com",
    name: "<Ada & Lovelace>",
    token: "raw-token_123",
  });

  const confirmationUrl =
    "https://app.example.com/verify-email?token=raw-token_123";
  assert.ok(sentMessage);
  assert.equal(sentMessage.from, "DBMetrics <no-reply@example.com>");
  assert.equal(sentMessage.to, "ada@example.com");
  assert.match(sentMessage.html, /&lt;Ada &amp; Lovelace&gt;/);
  assert.ok(sentMessage.html.includes(confirmationUrl));
  assert.ok(sentMessage.text.includes(confirmationUrl));
});

test("Resend sender reports provider failures without exposing provider details", async () => {
  const sender = new ResendEmailConfirmationSender(
    {
      emails: {
        send: async () => ({
          error: { message: "private provider response" },
        }),
      },
    },
    "no-reply@example.com",
    "https://app.example.com",
  );

  await assert.rejects(
    () =>
      sender.send({
        email: "ada@example.com",
        name: "Ada",
        token: "token",
      }),
    (error: unknown) =>
      error instanceof ServiceUnavailableException &&
      !error.message.includes("private provider response"),
  );
});

test("confirmation URL targets the frontend verify-email route", () => {
  assert.equal(
    buildEmailConfirmationUrl("https://app.example.com/base/", "abc-_123"),
    "https://app.example.com/base/verify-email?token=abc-_123",
  );
});

test("resend DTO trims and validates the email address", async () => {
  const dto = plainToInstance(ResendVerificationHttpDTO, {
    email: "  ADA@EXAMPLE.COM  ",
  });
  assert.equal(dto.email, "ADA@EXAMPLE.COM");
  assert.deepEqual(await validate(dto), []);

  const invalidDto = plainToInstance(ResendVerificationHttpDTO, {
    email: "not-an-email",
  });
  assert.notDeepEqual(await validate(invalidDto), []);
});

test("production registration fails clearly when Resend configuration is incomplete", () => {
  const names = [
    "NODE_ENV",
    "PUBLIC_REGISTRATION_ENABLED",
    "EMAIL_PROVIDER",
    "RESEND_API_KEY",
    "EMAIL_FROM",
    "PUBLIC_WEB_URL",
  ] as const;
  const previousValues = names.map((name) => process.env[name]);

  process.env.NODE_ENV = "production";
  process.env.PUBLIC_REGISTRATION_ENABLED = "true";
  for (const name of names.slice(2)) {
    delete process.env[name];
  }

  try {
    assert.throws(
      () => getPublicRegistrationEnabled(),
      /complete Resend configuration.*EMAIL_PROVIDER.*RESEND_API_KEY.*EMAIL_FROM.*PUBLIC_WEB_URL/,
    );
  } finally {
    names.forEach((name, index) => {
      const previousValue = previousValues[index];
      if (previousValue === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = previousValue;
      }
    });
  }
});

test("production startup accepts missing Resend variables while public registration is disabled", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousEnabled = process.env.PUBLIC_REGISTRATION_ENABLED;
  process.env.NODE_ENV = "production";
  process.env.PUBLIC_REGISTRATION_ENABLED = "false";

  try {
    assert.equal(getPublicRegistrationEnabled(), false);
  } finally {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
    if (previousEnabled === undefined) {
      delete process.env.PUBLIC_REGISTRATION_ENABLED;
    } else {
      process.env.PUBLIC_REGISTRATION_ENABLED = previousEnabled;
    }
  }
});

test("resend-verification returns the same response and sends nothing for unknown or verified users", async () => {
  for (const user of [null, verifiedUser()]) {
    let persisted = false;
    let sent = false;
    const useCase = new ResendVerificationUseCase(
      userRepository(user),
      publicRegistrationRepository(async () => {
        persisted = true;
        return { name: "Ada Lovelace", email: "ada@example.com" };
      }),
      {
        send: async () => {
          sent = true;
        },
      },
    );

    assert.deepEqual(await useCase.execute({ email: "ADA@example.com" }), genericResponse);
    assert.equal(persisted, false);
    assert.equal(sent, false);
  }
});

test("resend-verification normalizes email, stores only the token hash, then sends", async () => {
  const user = pendingUser();
  const order: string[] = [];
  let storedToken: EmailConfirmationToken | undefined;
  let sentToken = "";
  const useCase = new ResendVerificationUseCase(
    userRepository(user),
    publicRegistrationRepository(async (email, userId, token) => {
      order.push("persist");
      assert.equal(email, "ada@example.com");
      assert.equal(userId, user.id);
      storedToken = token;
      return { name: user.name, email: user.email };
    }),
    {
      send: async ({ token }) => {
        order.push("send");
        sentToken = token;
      },
    },
  );

  assert.deepEqual(
    await useCase.execute({ email: "  ADA@EXAMPLE.COM  " }),
    genericResponse,
  );
  assert.deepEqual(order, ["persist", "send"]);
  assert.ok(storedToken);
  assert.equal(storedToken.tokenHash, createHash("sha256").update(sentToken).digest("hex"));
  assert.notEqual(storedToken.tokenHash, sentToken);
  assert.equal(storedToken.userId, user.id);
  assert.ok(storedToken.expiresAt.getTime() - storedToken.createdAt.getTime() >= 24 * 60 * 60 * 1000 - 10);
});

test("resend-verification masks provider failures so the pending user can retry", async () => {
  const useCase = new ResendVerificationUseCase(
    userRepository(pendingUser()),
    publicRegistrationRepository(async () => ({
      name: "Ada Lovelace",
      email: "ada@example.com",
    })),
    {
      send: async () => {
        throw new Error("sensitive provider response");
      },
    },
  );

  await assert.rejects(
    () => useCase.execute({ email: "ada@example.com" }),
    (error: unknown) =>
      error instanceof ServiceUnavailableException &&
      error.message ===
        "Email confirmation could not be sent. Please try again later." &&
      !error.message.includes("sensitive provider response"),
  );
});

test("Prisma resend transaction invalidates unused confirmation tokens before creating the replacement", async () => {
  const calls: string[] = [];
  let invalidatedWhere: unknown;
  let createdData: unknown;
  let transactionOptions: { isolationLevel: string } | undefined;
  const transaction = {
    user: {
      findUnique: async () => ({
        id: "00000000-0000-4000-8000-000000000010",
        name: "Ada Lovelace",
        email: "ada@example.com",
        emailVerifiedAt: null,
      }),
    },
    emailConfirmationToken: {
      updateMany: async (args: { where: unknown; data: unknown }) => {
        calls.push("invalidate");
        invalidatedWhere = args.where;
        return { count: 1 };
      },
      create: async (args: { data: unknown }) => {
        calls.push("create");
        createdData = args.data;
      },
    },
  };
  const prisma = {
    $transaction: async (
      callback: (tx: typeof transaction) => Promise<unknown>,
      options: { isolationLevel: string },
    ) => {
      transactionOptions = options;
      return callback(transaction);
    },
  } as unknown as PrismaService;
  const repository = new PrismaPublicRegistrationRepository(prisma);
  const token = EmailConfirmationToken.create(
    "00000000-0000-4000-8000-000000000010",
    "hashed-new-token",
  );
  const now = new Date();

  await repository.replacePendingUserConfirmationToken(
    "ada@example.com",
    "00000000-0000-4000-8000-000000000010",
    token,
    now,
  );

  assert.deepEqual(calls, ["invalidate", "create"]);
  assert.deepEqual(invalidatedWhere, {
    userId: "00000000-0000-4000-8000-000000000010",
    usedAt: null,
    expiresAt: { gt: now },
  });
  assert.equal(transactionOptions?.isolationLevel, "Serializable");
  assert.equal(
    (createdData as { tokenHash: string }).tokenHash,
    "hashed-new-token",
  );
});
