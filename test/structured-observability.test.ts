import assert from "node:assert/strict";
import test from "node:test";
import { getLogLevel } from "../src/shared/config/environment.config";
import {
  redactSensitiveText,
  resolveRequestId,
  serializeHttpAccessLog,
  shouldIgnoreAccessLog,
} from "../src/shared/observability/structured-logging";

test("LOG_LEVEL defaults to info and rejects unsupported values", () => {
  const previousValue = process.env.LOG_LEVEL;

  try {
    delete process.env.LOG_LEVEL;
    assert.equal(getLogLevel(), "info");

    for (const level of [
      "trace",
      "debug",
      "info",
      "warn",
      "error",
      "fatal",
      "silent",
    ]) {
      process.env.LOG_LEVEL = level;
      assert.equal(getLogLevel(), level);
    }

    process.env.LOG_LEVEL = "verbose";
    assert.throws(
      () => getLogLevel(),
      /LOG_LEVEL must be one of: trace, debug, info, warn, error, fatal, silent/,
    );
  } finally {
    if (previousValue === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = previousValue;
    }
  }
});

test("request IDs accept safe external values and generate UUIDs otherwise", () => {
  const generatedId = "0b0b6c48-ec2c-4ce7-a82b-bf7a6428e190";
  assert.equal(resolveRequestId("frontend-request_123:abc"), "frontend-request_123:abc");
  assert.equal(resolveRequestId(undefined, () => generatedId), generatedId);
  assert.equal(resolveRequestId("malformed\r\nheader", () => generatedId), generatedId);
  assert.equal(resolveRequestId("x".repeat(129), () => generatedId), generatedId);
  assert.equal(resolveRequestId(["valid-but-duplicated"], () => generatedId), generatedId);
});

test("HTTP access serializer excludes query strings, headers, and request bodies", () => {
  const requestWithSensitiveData = {
    method: "GET",
    url: "/verify-email?token=confirmation-secret",
    id: "request-123",
    headers: {
      authorization: "Bearer jwt-secret",
      cookie: "session=session-secret",
      "x-api-key": "api-secret",
    },
    body: {
      password: "password-secret",
      token: "body-token",
    },
  };
  const logEntry = serializeHttpAccessLog(
    requestWithSensitiveData,
    { statusCode: 200 },
    12,
  );

  assert.deepEqual(logEntry, {
    method: "GET",
    path: "/verify-email",
    status: 200,
    durationMs: 12,
    requestId: "request-123",
  });
  assert.equal(JSON.stringify(logEntry).includes("secret"), false);
  assert.equal(JSON.stringify(logEntry).includes("token"), false);
});

test("health and readiness paths are excluded from ordinary access logging", () => {
  assert.equal(shouldIgnoreAccessLog("/health"), true);
  assert.equal(shouldIgnoreAccessLog("/health?token=secret"), true);
  assert.equal(shouldIgnoreAccessLog("/ready?check=1"), true);
  assert.equal(shouldIgnoreAccessLog("/auth/login"), false);
});

test("internal error text redacts credentials, tokens, and URL query values", () => {
  const safeText = redactSensitiveText(
    "password=hunter2 Authorization: Bearer abc.def?token=confirm-secret " +
      "postgresql://user:db-secret@localhost:5432/db",
  );

  assert.equal(safeText.includes("hunter2"), false);
  assert.equal(safeText.includes("abc.def"), false);
  assert.equal(safeText.includes("confirm-secret"), false);
  assert.equal(safeText.includes("db-secret"), false);
  assert.match(safeText, /\[REDACTED\]/);
});
