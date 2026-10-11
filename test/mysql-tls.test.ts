import assert from "node:assert/strict";
import test from "node:test";
import {
  getMysqlTlsOptions,
  MysqlTlsConfigurationError,
} from "../src/database-connection/infra/services/database-host-security";

test("production MySQL TLS requires CA validation and hostname identity", () => {
  const options = getMysqlTlsOptions("production", "project-ca-pem");
  assert.deepEqual(options, {
    ca: "project-ca-pem",
    rejectUnauthorized: true,
    verifyIdentity: true,
  });
  assert.deepEqual(getMysqlTlsOptions("production", "invalid-ca"), {
    ca: "invalid-ca",
    rejectUnauthorized: true,
    verifyIdentity: true,
  });
  assert.throws(() => getMysqlTlsOptions("production"), MysqlTlsConfigurationError);
});

test("development/test keep local MySQL connections usable without TLS", () => {
  assert.equal(getMysqlTlsOptions("development"), undefined);
  assert.equal(getMysqlTlsOptions("test"), undefined);
});
