import assert from "node:assert/strict";
import test from "node:test";
import { isPublicAddress, resolveDatabaseHost, UnsafeDatabaseHostError } from "./src/database-connection/infra/services/database-host-security";

test("classifies IPv4, IPv6 and special ranges", () => {
  for (const ip of ["8.8.8.8", "2606:4700:4700::1111", "::ffff:8.8.8.8"]) assert.equal(isPublicAddress(ip), true);
  for (const ip of ["127.0.0.1", "0.0.0.0", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.1.1", "100.64.0.1", "224.0.0.1", "240.0.0.1", "192.0.2.1", "::", "::1", "fc00::1", "fe80::1", "ff02::1", "2001:db8::1", "2002::1", "::ffff:127.0.0.1"]) assert.equal(isPublicAddress(ip), false, ip);
});

test("blocks AWS metadata literal without connecting to it", async () => {
  await assert.rejects(resolveDatabaseHost("169.254.169.254", "development"), UnsafeDatabaseHostError);
  await assert.rejects(resolveDatabaseHost("[fd00:ec2::254]", "test"), UnsafeDatabaseHostError);
});

test("accepts public DNS and rejects prohibited or mixed DNS answers", async () => {
  const result = await resolveDatabaseHost("db.example.test", "production", async () => ["8.8.8.8"]);
  assert.deepEqual(result.addresses, ["8.8.8.8"]);
  await assert.rejects(resolveDatabaseHost("db.example.test", "production", async () => ["10.0.0.4"]), UnsafeDatabaseHostError);
  await assert.rejects(resolveDatabaseHost("db.example.test", "production", async () => ["8.8.8.8", "192.168.1.4"]), UnsafeDatabaseHostError);
});

test("allows private Docker DNS only in development/test", async () => {
  for (const env of ["development", "test"]) assert.deepEqual((await resolveDatabaseHost("db", env, async () => ["172.20.0.4"])).addresses, ["172.20.0.4"]);
  await assert.rejects(resolveDatabaseHost("db", "production", async () => ["172.20.0.4"]), UnsafeDatabaseHostError);
});
