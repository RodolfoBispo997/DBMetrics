import assert from "node:assert/strict";
import test from "node:test";
import { ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { PinoLogger } from "nestjs-pino";
import { DomainError } from "../src/shared/errors/domain-error";
import { HttpExceptionLoggingFilter } from "../src/shared/filters/http-exception-logging.filter";

function createFilter() {
  const response = {};
  const replies: Array<{ body: unknown; statusCode: number }> = [];
  const logs: Array<{ level: "error" | "warn"; entry: unknown }> = [];
  const adapter = {
    isHeadersSent: () => false,
    reply: (_response: unknown, body: unknown, statusCode: number) => {
      replies.push({ body, statusCode });
    },
    end: () => undefined,
  };
  const logger = {
    error: (entry: unknown) => logs.push({ level: "error", entry }),
    warn: (entry: unknown) => logs.push({ level: "warn", entry }),
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  };
  const filter = new HttpExceptionLoggingFilter(
    { httpAdapter: adapter } as unknown as HttpAdapterHost,
    logger as unknown as PinoLogger,
  );

  return {
    filter,
    host: host as unknown as ArgumentsHost,
    replies,
    logs,
  };
}

test("DomainError 4xx preserves its status and message", () => {
  const { filter, host, replies } = createFilter();

  filter.catch(new DomainError("Invalid account state", 409), host);

  assert.deepEqual(replies, [
    {
      body: {
        statusCode: 409,
        message: "Invalid account state",
      },
      statusCode: 409,
    },
  ]);
});

test("DomainError 5xx hides its internal message and logs a sanitized stack", () => {
  const { filter, host, replies, logs } = createFilter();
  const exception = new DomainError(
    "password=private-diagnostic-password",
    503,
  );

  filter.catch(exception, host);

  assert.deepEqual(replies, [
    {
      body: {
        statusCode: 503,
        message: "Internal server error",
      },
      statusCode: 503,
    },
  ]);
  assert.equal(logs.length, 1);
  assert.equal(logs[0].level, "error");
  assert.equal(JSON.stringify(logs[0].entry).includes("private-diagnostic-password"), false);
  assert.match(JSON.stringify(logs[0].entry), /\[REDACTED\]/);
  assert.match(JSON.stringify(logs[0].entry), /stack/);
});

test("HttpException 5xx keeps its generic response and original status", () => {
  const { filter, host, replies } = createFilter();

  filter.catch(
    new HttpException("Sensitive framework detail", HttpStatus.BAD_GATEWAY),
    host,
  );

  assert.deepEqual(replies, [
    {
      body: {
        statusCode: 502,
        message: "Internal server error",
      },
      statusCode: 502,
    },
  ]);
});

test("unhandled errors keep their generic 500 response", () => {
  const { filter, host, replies } = createFilter();

  filter.catch(new Error("Sensitive implementation detail"), host);

  assert.deepEqual(replies, [
    {
      body: {
        statusCode: 500,
        message: "Internal server error",
      },
      statusCode: 500,
    },
  ]);
});
