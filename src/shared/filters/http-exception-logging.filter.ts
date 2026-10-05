import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { PinoLogger } from "nestjs-pino";

import { DomainError } from "@/shared/errors/domain-error";
import { redactSensitiveText } from "../observability/structured-logging";

@Catch()
export class HttpExceptionLoggingFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse();
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const statusCode =
      exception instanceof DomainError
        ? exception.statusCode
        : exception instanceof HttpException
          ? exception.getStatus()
          : 500;
    const error =
      exception instanceof Error ? exception : new Error("Unhandled exception");
    const logEntry = {
      statusCode,
      errorName: redactSensitiveText(error.name),
      ...(statusCode >= 500 && error.stack
        ? { stack: redactSensitiveText(error.stack) }
        : {}),
    };

    if (statusCode >= 500) {
      this.logger.error(logEntry, "HTTP exception");
    } else {
      this.logger.warn(logEntry, "HTTP exception");
    }

    if (httpAdapter.isHeadersSent(response)) {
      httpAdapter.end(response);
      return;
    }

    if (exception instanceof DomainError) {
      httpAdapter.reply(
        response,
        {
          statusCode: exception.statusCode,
          message:
            exception.statusCode >= 500
              ? "Internal server error"
              : exception.message,
        },
        exception.statusCode,
      );
      return;
    }

    if (exception instanceof HttpException) {
      if (statusCode >= 500) {
        httpAdapter.reply(
          response,
          {
            statusCode,
            message: "Internal server error",
          },
          statusCode,
        );
        return;
      }

      const exceptionResponse = exception.getResponse();
      httpAdapter.reply(
        response,
        typeof exceptionResponse === "object" && exceptionResponse !== null
          ? exceptionResponse
          : {
              statusCode,
              message: exceptionResponse,
            },
        statusCode,
      );
      return;
    }

    httpAdapter.reply(
      response,
      {
        statusCode: 500,
        message: "Internal server error",
      },
      500,
    );
  }
}
