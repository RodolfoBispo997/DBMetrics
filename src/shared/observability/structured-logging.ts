import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Params } from "nestjs-pino";
import { getLogLevel } from "../config/environment.config";

const requestIdPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const healthPaths = new Set(["/health", "/ready"]);

type HttpLogRequest = Pick<IncomingMessage, "method" | "url"> & {
  id?: unknown;
};

type HttpLogResponse = Pick<ServerResponse, "statusCode">;

export function resolveRequestId(
  header: string | string[] | undefined,
  generateId: () => string = randomUUID,
): string {
  if (typeof header === "string" && requestIdPattern.test(header)) {
    return header;
  }

  return generateId();
}

export function getPathWithoutQuery(url: string | undefined): string {
  if (!url) {
    return "/";
  }

  return url.split("?", 1)[0] || "/";
}

export function serializeHttpAccessLog(
  request: HttpLogRequest,
  response: HttpLogResponse,
  durationMs: number,
): {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  requestId: string;
} {
  return {
    method: request.method ?? "UNKNOWN",
    path: getPathWithoutQuery(request.url),
    status: response.statusCode,
    durationMs,
    requestId: typeof request.id === "string" ? request.id : "",
  };
}

function serializeHttpCompletionLog(
  request: HttpLogRequest,
  response: HttpLogResponse,
  durationMs: number,
): Omit<ReturnType<typeof serializeHttpAccessLog>, "requestId"> {
  const { requestId: _requestId, ...completionLog } = serializeHttpAccessLog(
    request,
    response,
    durationMs,
  );
  return completionLog;
}

export function shouldIgnoreAccessLog(url: string | undefined): boolean {
  return healthPaths.has(getPathWithoutQuery(url));
}

export function redactSensitiveText(value: string): string {
  return value
    .replace(/(?:postgres(?:ql)?|mysql):\/\/[^\s"'<>]+/gi, "[REDACTED_DATABASE_URL]")
    .replace(/[?&][^=\s&#]+=[^&#\s]*/g, "[REDACTED_QUERY]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[REDACTED_JWT]")
    .replace(
      /\b(authorization|cookie|api[_-]?key|jwt|password|access[_-]?token|confirmation[_-]?token|token|secret|credentials?)\b(\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,
      "$1$2[REDACTED]",
    );
}

function serializeErrorForLog(error: unknown): {
  type: string;
  message: string;
  stack?: string;
} {
  if (!(error instanceof Error)) {
    return { type: "Error", message: "An internal error occurred" };
  }

  return {
    type: redactSensitiveText(error.name),
    message: redactSensitiveText(error.message),
    ...(error.stack
      ? { stack: redactSensitiveText(error.stack) }
      : {}),
  };
}

export function createStructuredLoggerParams(): Params {
  return {
    pinoHttp: {
      level: getLogLevel(),
      genReqId: (request, response) => {
        const requestId = resolveRequestId(
          request.headers["x-request-id"],
        );
        response.setHeader("X-Request-Id", requestId);
        return requestId;
      },
      customAttributeKeys: {
        reqId: "requestId",
      },
      quietReqLogger: true,
      quietResLogger: true,
      customLogLevel: (_request, response) =>
        response.statusCode >= 500 ? "error" : "info",
      customSuccessObject: (request, response, fields) =>
        serializeHttpCompletionLog(
          request,
          response,
          fields.responseTime,
        ),
      customErrorObject: (request, response, _error, fields) =>
        serializeHttpCompletionLog(
          request,
          response,
          fields.responseTime,
        ),
      customSuccessMessage: () => "HTTP request completed",
      customErrorMessage: () => "HTTP request failed",
      autoLogging: {
        ignore: (request) => shouldIgnoreAccessLog(request.url),
      },
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          'req.headers["x-api-key"]',
          "authorization",
          "Authorization",
          "cookie",
          "Cookie",
          "set-cookie",
          "Set-Cookie",
          "password",
          "Password",
          "apiKey",
          "api_key",
          "apikey",
          '["api-key"]',
          "jwt",
          "JWT",
          "token",
          "Token",
          "accessToken",
          "access_token",
          "refreshToken",
          "refresh_token",
          "tokenHash",
          "token_hash",
          "confirmationToken",
          "confirmation_token",
          "emailConfirmationToken",
          "databaseUrl",
          "database_url",
          "DATABASE_URL",
          "connectionString",
          "connection_string",
          "credentials",
          "databaseCredentials",
          "*.password",
          "*.Password",
          "*.authorization",
          "*.Authorization",
          "*.cookie",
          "*.Cookie",
          "*.apiKey",
          "*.api_key",
          "*.apikey",
          '*["api-key"]',
          "*.jwt",
          "*.JWT",
          "*.token",
          "*.Token",
          "*.accessToken",
          "*.access_token",
          "*.refreshToken",
          "*.refresh_token",
          "*.tokenHash",
          "*.token_hash",
          "*.confirmationToken",
          "*.confirmation_token",
          "*.emailConfirmationToken",
          "*.databaseUrl",
          "*.database_url",
          "*.connectionString",
          "*.connection_string",
          "*.credentials",
          "*.databaseCredentials",
        ],
        censor: "[REDACTED]",
      },
      serializers: { err: serializeErrorForLog },
    },
  };
}
