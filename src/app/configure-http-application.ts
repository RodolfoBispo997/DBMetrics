import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { Application as ExpressApplication } from "express";
import cookieParser from "cookie-parser";
import { Logger as PinoNestLogger } from "nestjs-pino";
import { HttpExceptionLoggingFilter } from "../shared/filters/http-exception-logging.filter";
import { configureExpressTrustProxy } from "../shared/config/express-trust-proxy";

const DEFAULT_CORS_ORIGIN = "http://localhost:3000";

export function getCorsOrigins(value = process.env.CORS_ORIGIN): string[] {
  const origins = (value?.trim() || DEFAULT_CORS_ORIGIN)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.includes("*")) {
    throw new Error("CORS_ORIGIN cannot include '*' when credentials are enabled");
  }

  return origins;
}

export function isAllowedCorsOrigin(
  origin: string | undefined,
  allowedOrigins = getCorsOrigins(),
): boolean {
  return origin === undefined || allowedOrigins.includes(origin);
}

export function configureHttpApplication(
  app: INestApplication,
  expressApplication: ExpressApplication,
): void {
  app.useLogger(app.get(PinoNestLogger));
  app.flushLogs();

  configureExpressTrustProxy(expressApplication);
  app.use(cookieParser());

  const corsOrigins = getCorsOrigins();

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean | string) => void,
    ) => {
      if (origin === undefined) {
        callback(null, true);
        return;
      }

      callback(null, isAllowedCorsOrigin(origin, corsOrigins) ? origin : false);
    },
    credentials: true,
    exposedHeaders: ["X-Request-Id"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(app.get(HttpExceptionLoggingFilter));

  const config = new DocumentBuilder()
    .setTitle("DBMetrics API")
    .setDescription("API for monitoring database metrics")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
}
