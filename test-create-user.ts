import { BcryptHashGenerator } from "./src/shared/cryptography/bcrypt-hash-generator";
import { CreateUserUseCase } from "./src/user/application/use-cases/create-user/create-user.use-case";
import { PrismaUserRepository } from "./src/user/infra/repositories/prisma-user.repository";

async function main() {
  const repository = new PrismaUserRepository();
  const hashGenerator = new BcryptHashGenerator();

  const createUserUseCase = new CreateUserUseCase(repository, hashGenerator);

  const user = await createUserUseCase.execute({
    name: "Rodolfo Bispo",
    email: "rodolfo1@email.com",
    password: "123456789",
  });

  console.log(user);
}

main();
