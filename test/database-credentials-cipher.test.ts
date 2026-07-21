import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_CREDENTIALS_KEY = Buffer.alloc(32, 7).toString("base64");

import {
  getDatabaseCredentialsKey,
  parseDatabaseCredentialsKey,
} from "../src/shared/config/environment.config";
import { DatabaseCredentialsCipherService } from "../src/shared/security/database-credentials/database-credentials-cipher.service";
import { InvalidEncryptedDatabaseCredentialError } from "../src/shared/security/database-credentials/errors/invalid-encrypted-database-credential.error";

const cipher = new DatabaseCredentialsCipherService();

test("encrypts and decrypts a database credential", () => {
  const encrypted = cipher.encrypt("database-password");

  assert.match(encrypted, /^v1:/);
  assert.equal(cipher.decrypt(encrypted), "database-password");
});

test("uses a random IV for each encryption", () => {
  assert.notEqual(cipher.encrypt("database-password"), cipher.encrypt("database-password"));
});

test("rejects missing, invalid and incorrectly sized keys", () => {
  const validKey = process.env.DATABASE_CREDENTIALS_KEY;
  delete process.env.DATABASE_CREDENTIALS_KEY;
  assert.throws(() => getDatabaseCredentialsKey());
  process.env.DATABASE_CREDENTIALS_KEY = validKey;

  assert.throws(() => parseDatabaseCredentialsKey(""));
  assert.throws(() => parseDatabaseCredentialsKey("not-base64"));
  assert.throws(() => parseDatabaseCredentialsKey(Buffer.alloc(31).toString("base64")));
});

test("rejects malformed, unknown-version and invalid-size payloads", () => {
  assert.throws(() => cipher.decrypt("invalid"), InvalidEncryptedDatabaseCredentialError);
  assert.throws(
    () => cipher.decrypt("v2:AAAAAAAAAAAAAAAA:AAAAAAAAAAAAAAAAAAAAAA==:YQ=="),
    InvalidEncryptedDatabaseCredentialError,
  );
  assert.throws(
    () => cipher.decrypt("v1:AAAAAAAAAAAAAA==:AAAAAAAAAAAAAAAAAAAAAA==:YQ=="),
    InvalidEncryptedDatabaseCredentialError,
  );
  assert.throws(
    () => cipher.decrypt("v1:AAAAAAAAAAAAAAAA:AAAAAAAAAAAAAA==:YQ=="),
    InvalidEncryptedDatabaseCredentialError,
  );
});

test("rejects modified ciphertext and authentication tag", () => {
  const encrypted = cipher.encrypt("database-password");
  const [version, iv, tag, ciphertext] = encrypted.split(":");
  const modifiedCiphertext = Buffer.from(ciphertext, "base64");
  modifiedCiphertext[0] ^= 1;
  const modifiedTag = Buffer.from(tag, "base64");
  modifiedTag[0] ^= 1;

  assert.throws(
    () => cipher.decrypt([version, iv, tag, modifiedCiphertext.toString("base64")].join(":")),
    InvalidEncryptedDatabaseCredentialError,
  );
  assert.throws(
    () => cipher.decrypt([version, iv, modifiedTag.toString("base64"), ciphertext].join(":")),
    InvalidEncryptedDatabaseCredentialError,
  );
});
