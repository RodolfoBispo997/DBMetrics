import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import { randomUUID } from "node:crypto";
import type { INestApplication } from "@nestjs/common";
import { ExpressAdapter } from "@nestjs/platform-express";
import type { Application as ExpressApplication } from "express";
import { Test } from "@nestjs/testing";
import bcrypt from "bcryptjs";
import request from "supertest";
import { AppModule } from "../../dist/app/app.module";
import { configureHttpApplication } from "../../dist/app/configure-http-application";
import { PrismaService } from "../../dist/shared/infra/database/prisma/prisma.service";
import { UserRole } from "../../dist/user/domain/enums/user-role.enum";

let app: INestApplication;
let prisma: PrismaService;
let baseUrl: string;
const userEmail = `e2e-${randomUUID()}@example.com`;
const userPassword = "e2e-correct-password";

before(async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const expressAdapter = new ExpressAdapter();
  app = testingModule.createNestApplication(expressAdapter);
  configureHttpApplication(
    app,
    expressAdapter.getInstance<ExpressApplication>(),
  );
  await app.init();

  prisma = app.get(PrismaService);
  await prisma.user.create({
    data: {
      name: "E2E Test User",
      email: userEmail,
      password: await bcrypt.hash(userPassword, 4),
      role: UserRole.MEMBER,
      emailVerifiedAt: new Date(),
    },
  });

  await app.listen(0, "127.0.0.1");
  const address = app.getHttpServer().address();
  if (!address || typeof address === "string") {
    throw new Error("Could not determine the local E2E listener address");
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (app) {
    if (prisma) {
      await prisma.user.deleteMany({ where: { email: userEmail } });
    }
    await app.close();
  }
});

test("GET /health returns liveness without database dependency", async () => {
  await request(baseUrl).get("/health").expect(200, { status: "ok" });
});

test("GET /ready responds ready with the ephemeral PostgreSQL database", async () => {
  await request(baseUrl).get("/ready").expect(200, { status: "ready" });
});

test("POST /auth/register remains unavailable while public registration is disabled", async () => {
  await request(baseUrl)
    .post("/auth/register")
    .send({
      name: "Not Registered",
      email: `disabled-${randomUUID()}@example.com`,
      password: "valid-password",
    })
    .expect(404);
});

test("login with an account seeded in PostgreSQL returns a valid access token", async () => {
  const response = await request(baseUrl)
    .post("/auth/login")
    .send({ email: userEmail, password: userPassword })
    .expect(200);
  const accessToken = response.body.accessToken;

  assert.equal(typeof accessToken, "string");
  assert.ok(accessToken.length > 0);
  await request(baseUrl)
    .get("/auth/me")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);
});

test("login with invalid credentials returns unauthorized", async () => {
  await request(baseUrl)
    .post("/auth/login")
    .send({ email: userEmail, password: "wrong-password" })
    .expect(401);
});

test("global ValidationPipe rejects invalid login payloads", async () => {
  await request(baseUrl)
    .post("/auth/login")
    .send({ email: "invalid-email", password: "short" })
    .expect(400);
});
