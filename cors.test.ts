import assert from "node:assert/strict";
import test from "node:test";
import { getCorsOrigins, isAllowedCorsOrigin } from "./src/app/configure-http-application";

const origins = getCorsOrigins("https://db-metrics-front.vercel.app, https://dbmetrics.com.br");

test("CORS accepts both configured origins", () => {
  assert.equal(isAllowedCorsOrigin("https://db-metrics-front.vercel.app", origins), true);
  assert.equal(isAllowedCorsOrigin("https://dbmetrics.com.br", origins), true);
});

test("CORS rejects unknown origins", () => {
  assert.equal(isAllowedCorsOrigin("https://unknown.example.com", origins), false);
});

test("CORS rejects wildcard origins with credentials", () => {
  assert.throws(() => getCorsOrigins("https://dbmetrics.com.br, *"), /cannot include/);
});

test("CORS returns exactly the request origin", () => {
  const requestOrigin = "https://db-metrics-front.vercel.app";
  const result = isAllowedCorsOrigin(requestOrigin, origins) ? requestOrigin : false;

  assert.equal(result, "https://db-metrics-front.vercel.app");
  assert.notEqual(result, origins.join(","));
});
