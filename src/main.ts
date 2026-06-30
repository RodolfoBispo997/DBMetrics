import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { ValidationPipe } from "@nestjs/common";
import { DomainExceptionFilter } from "./shared/filters/domain-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Cors para conectar com o front-end
  app.enableCors({
    origin: "http://localhost:3000",
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

  await app.listen(3333);

  console.log("Server running on http://localhost:3333");
}

bootstrap();
