import { CreateUserUseCase } from "./src/user/application/use-cases/create-user/create-user.use-case";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./src/app/app.module";

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const createUserUseCase = app.get(CreateUserUseCase, { strict: false });
    const user = await createUserUseCase.execute({
      name: "Rodolfo Bispo",
      email: "rodolfo1@email.com",
      password: "123456789",
    });

    console.log(user);
  } finally {
    await app.close();
  }
}

main();
