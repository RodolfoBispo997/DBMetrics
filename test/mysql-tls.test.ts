import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { connect as netConnect } from "node:net";
import { createServer } from "node:tls";
import test from "node:test";
import {
  MysqlTlsConfigurationError,
  secureMysqlStream,
} from "../src/database-connection/infra/services/database-host-security";

function certificate() {
  const directory = mkdtempSync(join(tmpdir(), "dbmetrics-mysql-tls-"));
  const key = join(directory, "key.pem");
  const cert = join(directory, "cert.pem");
  execFileSync("openssl", [
    "req", "-x509", "-newkey", "rsa:2048", "-nodes",
    "-subj", "/CN=localhost", "-addext", "subjectAltName=DNS:localhost",
    "-keyout", key, "-out", cert, "-days", "1",
  ], { stdio: "ignore" });
  return { directory, key: readFileSync(key), cert: readFileSync(cert) };
}

async function openTlsServer() {
  const material = certificate();
  const server = createServer(material, (socket) => socket.end());
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  return { ...material, server, port: address.port };
}

test("production MySQL TLS validates the CA and original hostname", async () => {
  const fixture = await openTlsServer();
  try {
    const socket = netConnect(fixture.port, "127.0.0.1");
    const secure = await secureMysqlStream(socket, "localhost", "production", fixture.cert.toString());
    assert.equal(secure.encrypted, true);
    secure.destroy();

    const wrongHostSocket = netConnect(fixture.port, "127.0.0.1");
    await assert.rejects(
      secureMysqlStream(wrongHostSocket, "not-localhost.example", "production", fixture.cert.toString()),
    );

    const badCaSocket = netConnect(fixture.port, "127.0.0.1");
    await assert.rejects(
      secureMysqlStream(badCaSocket, "localhost", "production", "-----BEGIN CERTIFICATE-----\ninvalid\n-----END CERTIFICATE-----"),
    );
  } finally {
    await new Promise<void>((resolve) => fixture.server.close(() => resolve()));
    rmSync(fixture.directory, { recursive: true, force: true });
  }
});

test("production refuses missing CA while development/test preserve local sockets", async () => {
  const socket = netConnect(9, "127.0.0.1");
  await assert.rejects(
    secureMysqlStream(socket, "localhost", "production"),
    MysqlTlsConfigurationError,
  );
  socket.destroy();

  const localSocket = netConnect(9, "127.0.0.1");
  assert.equal(await secureMysqlStream(localSocket, "localhost", "development"), localSocket);
  localSocket.destroy();
});
