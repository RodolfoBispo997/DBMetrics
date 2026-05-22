import { BcryptHashComparer } from "./src/shared/cryptography/bcrypt-hash-comparer";
import { AuthenticateUserUseCase } from "./src/user/application/use-cases/authenticate-user/authenticate-user-use-case";
import { PrismaUserRepository } from "./src/user/infra/repositories/prisma-user.repository";

async function login() {
  const prismaUserRepository = new PrismaUserRepository();
  const hashComparer = new BcryptHashComparer();

  const authenticateUseCase = new AuthenticateUserUseCase(
    prismaUserRepository,
    hashComparer,
  );

  const user = await authenticateUseCase.execute({
    email: "rodolfo1@email.com",
    password: "1789",
  });

  console.log(user);
}

login();
