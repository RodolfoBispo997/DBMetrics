import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { getDatabaseCredentialsKey } from "../../config/environment.config";
import {
  DATABASE_CREDENTIALS_AUTH_TAG_LENGTH,
  DATABASE_CREDENTIALS_IV_LENGTH,
  parseDatabaseCredentialsPayload,
  serializeDatabaseCredentialsPayload,
} from "./database-credentials-payload";
import { InvalidEncryptedDatabaseCredentialError } from "./errors/invalid-encrypted-database-credential.error";

@Injectable()
export class DatabaseCredentialsCipherService {
  encrypt(plainText: string): string {
    const iv = randomBytes(DATABASE_CREDENTIALS_IV_LENGTH);
    const cipher = createCipheriv(
      "aes-256-gcm",
      getDatabaseCredentialsKey(),
      iv,
      { authTagLength: DATABASE_CREDENTIALS_AUTH_TAG_LENGTH },
    );
    const ciphertext = Buffer.concat([
      cipher.update(plainText, "utf8"),
      cipher.final(),
    ]);

    return serializeDatabaseCredentialsPayload({
      iv,
      authTag: cipher.getAuthTag(),
      ciphertext,
    });
  }

  decrypt(encryptedValue: string): string {
    try {
      const { iv, authTag, ciphertext } = parseDatabaseCredentialsPayload(
        encryptedValue,
      );
      const decipher = createDecipheriv(
        "aes-256-gcm",
        getDatabaseCredentialsKey(),
        iv,
        { authTagLength: DATABASE_CREDENTIALS_AUTH_TAG_LENGTH },
      );
      decipher.setAuthTag(authTag);

      return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]).toString("utf8");
    } catch {
      throw new InvalidEncryptedDatabaseCredentialError();
    }
  }
}
