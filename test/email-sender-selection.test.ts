import assert from "node:assert/strict";
import test from "node:test";
import { createEmailConfirmationSender } from "../src/auth/email-confirmation-sender.factory";
import type { EnvironmentConfig } from "../src/shared/config/environment.config";
import { LocalEmailConfirmationSender } from "../src/user/infra/email-confirmation/local-email-confirmation-sender";
import { ResendEmailConfirmationSender, type ResendEmailClient } from "../src/user/infra/email-confirmation/resend-email-confirmation-sender";
import { UnconfiguredEmailConfirmationSender } from "../src/user/infra/email-confirmation/unconfigured-email-confirmation-sender";

function config(provider: "resend" | "local" | undefined, publicRegistrationEnabled = true): EnvironmentConfig {
  return {
    jwtSecret: "test-jwt-secret",
    databaseCredentialsKey: Buffer.alloc(32),
    scheduler: { databaseMetrics: { enabled: false, cron: "* * * * *", connectionTimeoutMs: 1 } },
    mysql: { tlsCa: undefined },
    evolution: { baseUrl: "", apiKey: "", instance: "" },
    alerts: { asyncDeliveryEnabled: false, rabbitMqUrl: "", outbox: { leaseMs: 1, pollIntervalMs: 1, maxAttempts: 1, retryBaseDelayMs: 1, retryMaxDelayMs: 1 } },
    publicRegistrationEnabled,
    appReadinessTimeoutMs: 1,
    refreshTokenTtlDays: 1,
    email: { provider, apiKey: provider === "resend" ? "test-key-not-logged" : undefined, from: provider === "resend" ? "DBMetrics <no-reply@example.com>" : undefined, publicWebUrl: "https://app.example.com" },
  };
}

test("EMAIL_PROVIDER=resend selects Resend in development", () => {
  const sender = createEmailConfirmationSender(config("resend"), { nodeEnvironment: "development", resendClient: { emails: { send: async () => ({ error: null }) } } });
  assert.ok(sender instanceof ResendEmailConfirmationSender);
});

test("EMAIL_PROVIDER=local explicitly selects local sender in development", () => {
  assert.ok(createEmailConfirmationSender(config("local"), { nodeEnvironment: "development" }) instanceof LocalEmailConfirmationSender);
});

test("local provider is rejected when public registration is enabled in production", () => {
  assert.throws(() => createEmailConfirmationSender(config("local"), { nodeEnvironment: "production" }), /complete Resend configuration/);
});

test("unset provider defaults to local only in development and unconfigured in production", () => {
  assert.ok(createEmailConfirmationSender(config(undefined, false), { nodeEnvironment: "development" }) instanceof LocalEmailConfirmationSender);
  assert.ok(createEmailConfirmationSender(config(undefined, false), { nodeEnvironment: "production" }) instanceof UnconfiguredEmailConfirmationSender);
});

test("Resend send logs safe metadata and removes both token and API key from provider errors", async () => {
  const captured: unknown[] = [];
  const oldLog = console.log;
  const oldError = console.error;
  console.log = (...values: unknown[]) => captured.push(values);
  console.error = (...values: unknown[]) => captured.push(values);
  const secretToken = "confirmation-token-secret";
  const secretApiKey = "resend-api-key-secret";
  let sent: { from: string; to: string } | undefined;
  const client: ResendEmailClient = { emails: { send: async (message) => {
    sent = message;
    return { error: Object.assign(new Error(`failure ${secretToken} ${secretApiKey}`), { code: "test_error" }) };
  } } };
  try {
    await assert.rejects(new ResendEmailConfirmationSender(client, "DBMetrics <no-reply@example.com>", "https://app.example.com").send({ email: "private.person@example.com", name: "Private", token: secretToken }));
  } finally {
    console.log = oldLog;
    console.error = oldError;
  }
  assert.deepEqual(sent && { from: sent.from, to: sent.to }, { from: "DBMetrics <no-reply@example.com>", to: "private.person@example.com" });
  const output = JSON.stringify(captured);
  assert.match(output, /"provider":"resend"/);
  assert.match(output, /"to":"pr\*+@example\.com"/);
  assert.match(output, /"status":"error"/);
  assert.match(output, /"code":"test_error"/);
  assert.equal(output.includes(secretToken), false);
  assert.equal(output.includes(secretApiKey), false);
  assert.equal(output.includes("private.person@example.com"), false);
});
