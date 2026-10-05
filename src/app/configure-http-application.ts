import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { Application as ExpressApplication } from "express";
import { DomainExceptionFilter } from "../shared/filters/domain-exception.filter";
import { configureExpressTrustProxy } from "../shared/config/express-trust-proxy";

export function configureHttpApplication(
  app: INestApplication,
  expressApplication: ExpressApplication,
): void {
  configureExpressTrustProxy(expressApplication);

  const corsOrigin = process.env.CORS_ORIGIN?.trim() || "http://localhost:3000";
  if (corsOrigin === "*") {
    throw new Error("CORS_ORIGIN cannot be '*' when credentials are enabled");
  }

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle("DBMetrics API")
    .setDescription("API for monitoring database metrics")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
}
