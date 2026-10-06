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
import { serializeHttpAccessLog } from "../../dist/shared/observability/structured-logging";

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

test("responses expose and preserve a valid external request ID", async () => {
  const requestId = "e2e-request-123";
  const response = await request(baseUrl)
    .get("/health")
    .set("X-Request-Id", requestId)
    .expect(200);
  const generatedResponse = await request(baseUrl).get("/health").expect(200);
  const malformedHeaderResponse = await request(baseUrl)
    .get("/health")
    .set("X-Request-Id", "x".repeat(129))
    .expect(200);
  const preflightResponse = await request(baseUrl)
    .options("/health")
    .set("Origin", "http://localhost:3000")
    .set("Access-Control-Request-Method", "GET")
    .expect(204);

  assert.equal(response.headers["x-request-id"], requestId);
  assert.match(
    generatedResponse.headers["x-request-id"],
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
  assert.match(
    malformedHeaderResponse.headers["x-request-id"],
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
  assert.equal(
    preflightResponse.headers["access-control-expose-headers"],
    "X-Request-Id",
  );
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

test("refresh rotates the HttpOnly cookie and logout revokes it", async () => {
  const loginResponse = await request(baseUrl)
    .post("/auth/login")
    .send({ email: userEmail, password: userPassword })
    .expect(200);
  const loginCookie = loginResponse.headers["set-cookie"]?.[0];
  assert.equal(typeof loginResponse.body.refreshToken, "undefined");
  assert.ok(loginCookie);
  assert.match(loginCookie, /^dbmetrics_refresh_token=/);
  assert.match(loginCookie, /HttpOnly/i);
  assert.match(loginCookie, /SameSite=Lax/i);
  assert.match(loginCookie, /Path=\/auth/i);
  assert.doesNotMatch(loginCookie, /;\s*Secure(?:;|$)/i);
  const oldCookiePair = loginCookie.split(";", 1)[0];
  const oldRefreshToken = oldCookiePair.slice(oldCookiePair.indexOf("=") + 1);
  assert.equal(JSON.stringify(loginResponse.body).includes(oldRefreshToken), false);
  assert.match(loginCookie, /Max-Age=2592000/i);
  const accessLog = serializeHttpAccessLog(
    {
      method: "POST",
      url: "/auth/login?marker=must-not-be-logged",
      id: "refresh-e2e-request",
      headers: { cookie: loginCookie },
      body: loginResponse.body,
    },
    { statusCode: loginResponse.status, headers: { "set-cookie": loginCookie } },
    1,
  );
  assert.equal(JSON.stringify(accessLog).includes(oldRefreshToken), false);
  assert.equal(JSON.stringify(accessLog).includes("must-not-be-logged"), false);

  const refreshResponse = await request(baseUrl)
    .post("/auth/refresh")
    .set("Cookie", oldCookiePair)
    .expect(200);
  const rotatedCookie = refreshResponse.headers["set-cookie"]?.[0];
  assert.equal(typeof refreshResponse.body.accessToken, "string");
  assert.equal(typeof refreshResponse.body.refreshToken, "undefined");
  assert.ok(rotatedCookie);
  const rotatedCookiePair = rotatedCookie.split(";", 1)[0];
  const rotatedRefreshToken = rotatedCookiePair.slice(
    rotatedCookiePair.indexOf("=") + 1,
  );
  assert.notEqual(rotatedRefreshToken, oldRefreshToken);
  assert.equal(JSON.stringify(refreshResponse.body).includes(rotatedRefreshToken), false);

  await request(baseUrl)
    .post("/auth/refresh")
    .set("Cookie", oldCookiePair)
    .expect(401, { statusCode: 401, message: "Invalid refresh session" });

  const logoutResponse = await request(baseUrl)
    .post("/auth/logout")
    .set("Cookie", rotatedCookiePair)
    .expect(204);
  assert.match(logoutResponse.headers["set-cookie"]?.[0] ?? "", /Path=\/auth/i);
  assert.match(logoutResponse.headers["set-cookie"]?.[0] ?? "", /HttpOnly/i);

  await request(baseUrl)
    .post("/auth/refresh")
    .set("Cookie", rotatedCookiePair)
    .expect(401, { statusCode: 401, message: "Invalid refresh session" });
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
