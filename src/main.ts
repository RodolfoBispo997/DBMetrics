import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import type { Application as ExpressApplication } from "express";
import { AppModule } from "./app/app.module";
import { configureHttpApplication } from "./app/configure-http-application";
import { enableGracefulShutdown } from "./shared/lifecycle/enable-graceful-shutdown";

async function bootstrap() {
  const expressAdapter = new ExpressAdapter();
  const app = await NestFactory.create(AppModule, expressAdapter);
  enableGracefulShutdown(app);
  configureHttpApplication(
    app,
    expressAdapter.getInstance<ExpressApplication>(),
  );

  await app.listen(3333);

  console.log("Server running on http://localhost:3333");
}

bootstrap();
