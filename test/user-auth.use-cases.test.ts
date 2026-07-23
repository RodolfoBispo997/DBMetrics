import assert from "node:assert/strict";
import test from "node:test";
import { JwtService } from "@nestjs/jwt";
import { CreateUserUseCase } from "../src/user/application/use-cases/create-user/create-user.use-case";
import { AuthenticateUserUseCase } from "../src/user/application/use-cases/authenticate-user/authenticate-user-use-case";
import { User } from "../src/user/domain/entities/user.entity";
import { UserRole } from "../src/user/domain/enums/user-role.enum";
import { EmailAlreadyExistsError } from "../src/user/domain/errors/email-already-exists-error";
import { InvalidCredentialsError } from "../src/user/domain/errors/invalid-credentials-error";
import { InvalidNameError } from "../src/user/domain/errors/invalid-name-error";

const input = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "plain-password",
};
const makeUser = (role = UserRole.ADMIN) =>
  User.restore({
    id: "00000000-0000-4000-8000-000000000001",
    ...input,
    password: "hashed-password",
    role,
  });

test("CreateUserUseCase hashes and persists a new user without exposing password", async () => {
  let saved: User | undefined;
  const hashes: string[] = [];
  const useCase = new CreateUserUseCase(
    {
      findByEmail: async () => null,
      findById: async () => null,
      save: async (user) => {
        saved = user;
      },
    },
    {
      hash: async (password) => {
        hashes.push(password);
        return "hashed-password";
      },
    },
  );

  const result = await useCase.execute(input);
  assert.deepEqual(hashes, [input.password]);
  assert.equal(saved?.password, "hashed-password");
  assert.equal(result.role, UserRole.ADMIN);
  assert.deepEqual(Object.keys(result).sort(), ["email", "id", "name", "role"]);
});

test("CreateUserUseCase preserves an explicit role and rejects duplicates before hashing", async () => {
  let hashed = false;
  let authorizedSaveCalls = 0;
  let duplicateSaveCalls = 0;
  const create = new CreateUserUseCase(
    {
      findByEmail: async () => null,
      findById: async () => null,
      save: async () => {
        authorizedSaveCalls++;
      },
    },
    { hash: async () => "hashed-password" },
  );
  assert.equal(
    (await create.execute({ ...input, role: UserRole.VIEWER })).role,
    UserRole.VIEWER,
  );
  const duplicate = new CreateUserUseCase(
    {
      findByEmail: async () => makeUser(),
      findById: async () => null,
      save: async () => {
        duplicateSaveCalls++;
      },
    },
    {
      hash: async () => {
        hashed = true;
        return "hash";
      },
    },
  );
  await assert.rejects(() => duplicate.execute(input), EmailAlreadyExistsError);
  assert.equal(hashed, false);
  assert.equal(authorizedSaveCalls, 1);
  assert.equal(duplicateSaveCalls, 0);
});

test("CreateUserUseCase propagates entity validation failures", async () => {
  const useCase = new CreateUserUseCase(
    {
      findByEmail: async () => null,
      findById: async () => null,
      save: async () => undefined,
    },
    { hash: async () => "hash" },
  );
  await assert.rejects(
    () => useCase.execute({ ...input, name: "x" }),
    InvalidNameError,
  );
});

test("AuthenticateUserUseCase compares the persisted hash and signs the exact safe payload", async () => {
  const compared: string[][] = [];
  let payload: unknown;
  const useCase = new AuthenticateUserUseCase(
    {
      findByEmail: async () => makeUser(UserRole.MEMBER),
      findById: async () => null,
      save: async () => undefined,
    },
    {
      compare: async (value, hash) => {
        compared.push([value, hash]);
        return true;
      },
    },
    {
      signAsync: async (value: unknown) => {
        payload = value;
        return "token";
      },
    } as JwtService,
  );
  assert.deepEqual(
    await useCase.execute({ email: input.email, password: input.password }),
    { accessToken: "token" },
  );
  assert.deepEqual(compared, [[input.password, "hashed-password"]]);
  assert.deepEqual(payload, {
    sub: "00000000-0000-4000-8000-000000000001",
    email: input.email,
    role: UserRole.MEMBER,
  });
});

test("AuthenticateUserUseCase uses one indistinguishable error and never signs invalid credentials", async () => {
  for (const user of [null, makeUser()]) {
    let signed = false;
    const useCase = new AuthenticateUserUseCase(
      {
        findByEmail: async () => user,
        findById: async () => null,
        save: async () => undefined,
      },
      { compare: async () => false },
      {
        signAsync: async () => {
          signed = true;
          return "token";
        },
      } as JwtService,
    );
    await assert.rejects(
      () => useCase.execute({ email: input.email, password: "wrong" }),
      InvalidCredentialsError,
    );
    assert.equal(signed, false);
  }
});
