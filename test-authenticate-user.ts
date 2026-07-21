import { AuthenticateUserUseCase } from "./src/user/application/use-cases/authenticate-user/authenticate-user-use-case";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./src/app/app.module";

async function login() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const authenticateUseCase = app.get(AuthenticateUserUseCase, {
      strict: false,
    });
    const user = await authenticateUseCase.execute({
      email: "rodolfo1@email.com",
      password: "1789",
    });

    console.log(user);
  } finally {
    await app.close();
  }
}

login();
