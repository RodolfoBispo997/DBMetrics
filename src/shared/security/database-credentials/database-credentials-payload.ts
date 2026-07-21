import { InvalidEncryptedDatabaseCredentialError } from "./errors/invalid-encrypted-database-credential.error";

export const DATABASE_CREDENTIALS_PAYLOAD_VERSION = "v1";
export const DATABASE_CREDENTIALS_IV_LENGTH = 12;
export const DATABASE_CREDENTIALS_AUTH_TAG_LENGTH = 16;

export type DatabaseCredentialsPayload = {
  iv: Buffer;
  authTag: Buffer;
  ciphertext: Buffer;
};

export function serializeDatabaseCredentialsPayload(
  payload: DatabaseCredentialsPayload,
): string {
  return [
    DATABASE_CREDENTIALS_PAYLOAD_VERSION,
    payload.iv.toString("base64"),
    payload.authTag.toString("base64"),
    payload.ciphertext.toString("base64"),
  ].join(":");
}

export function parseDatabaseCredentialsPayload(
  value: string,
): DatabaseCredentialsPayload {
  const parts = value.split(":");

  if (
    parts.length !== 4 ||
    parts[0] !== DATABASE_CREDENTIALS_PAYLOAD_VERSION
  ) {
    throw new InvalidEncryptedDatabaseCredentialError();
  }

  const iv = parseBase64(parts[1]);
  const authTag = parseBase64(parts[2]);
  const ciphertext = parseBase64(parts[3]);

  if (
    iv.length !== DATABASE_CREDENTIALS_IV_LENGTH ||
    authTag.length !== DATABASE_CREDENTIALS_AUTH_TAG_LENGTH ||
    ciphertext.length === 0
  ) {
    throw new InvalidEncryptedDatabaseCredentialError();
  }

  return { iv, authTag, ciphertext };
}

export function isDatabaseCredentialsPayload(value: string): boolean {
  try {
    parseDatabaseCredentialsPayload(value);
    return true;
  } catch {
    return false;
  }
}

function parseBase64(value: string): Buffer {
  if (!value || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new InvalidEncryptedDatabaseCredentialError();
  }

  const decoded = Buffer.from(value, "base64");

  if (decoded.toString("base64") !== value) {
    throw new InvalidEncryptedDatabaseCredentialError();
  }

  return decoded;
}
