import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { Logger as PinoNestLogger } from "nestjs-pino";
import type { Application as ExpressApplication } from "express";
import { AppModule } from "./app/app.module";
import { configureHttpApplication } from "./app/configure-http-application";
import { enableGracefulShutdown } from "./shared/lifecycle/enable-graceful-shutdown";

async function bootstrap() {
  const expressAdapter = new ExpressAdapter();
  const app = await NestFactory.create(AppModule, expressAdapter, {
    bufferLogs: true,
  });
  enableGracefulShutdown(app);
  configureHttpApplication(
    app,
    expressAdapter.getInstance<ExpressApplication>(),
  );

  await app.listen(3333);

  app.get(PinoNestLogger).log("Server running on http://localhost:3333");
}

bootstrap();
