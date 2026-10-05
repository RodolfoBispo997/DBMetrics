import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import type { Application as ExpressApplication } from "express";
import { AppModule } from "./app/app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { DomainExceptionFilter } from "./shared/filters/domain-exception.filter";
import { configureExpressTrustProxy } from "./shared/config/express-trust-proxy";
import { enableGracefulShutdown } from "./shared/lifecycle/enable-graceful-shutdown";

async function bootstrap() {
  const expressAdapter = new ExpressAdapter();
  const app = await NestFactory.create(AppModule, expressAdapter);
  enableGracefulShutdown(app);
  configureExpressTrustProxy(
    expressAdapter.getInstance<ExpressApplication>(),
  );
  const corsOrigin = process.env.CORS_ORIGIN?.trim() || "http://localhost:3000";

  if (corsOrigin === "*") {
    throw new Error("CORS_ORIGIN cannot be '*' when credentials are enabled");
  }

  //Cors para conectar com o front-end
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

  await app.listen(3333);

  console.log("Server running on http://localhost:3333");
}

bootstrap();
