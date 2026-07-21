import { PrismaClient } from "../../generated/prisma/client";
import { DatabaseCredentialsCipherService } from "../../src/shared/security/database-credentials/database-credentials-cipher.service";
import { isDatabaseCredentialsPayload } from "../../src/shared/security/database-credentials/database-credentials-payload";

const prisma = new PrismaClient();
const cipher = new DatabaseCredentialsCipherService();

async function main(): Promise<void> {
  // Validates DATABASE_CREDENTIALS_KEY before opening a database connection.
  cipher.encrypt("migration-key-validation");

  const connections = await prisma.databaseConnection.findMany({
    select: { id: true, password: true },
    orderBy: { id: "asc" },
  });

  let encrypted = 0;
  let alreadyEncrypted = 0;

  for (const connection of connections) {
    if (
      connection.password.startsWith("v1:") &&
      !isDatabaseCredentialsPayload(connection.password)
    ) {
      throw new Error(
        `Database connection ${connection.id} has an invalid encrypted password`,
      );
    }

    if (isDatabaseCredentialsPayload(connection.password)) {
      try {
        cipher.decrypt(connection.password);
        alreadyEncrypted++;
        continue;
      } catch {
        throw new Error(
          `Database connection ${connection.id} has an invalid encrypted password`,
        );
      }
    }

    await prisma.databaseConnection.update({
      where: { id: connection.id },
      data: { password: cipher.encrypt(connection.password) },
    });
    encrypted++;
    console.log(`Encrypted database connection ${connection.id}`);
  }

  const migratedConnections = await prisma.databaseConnection.findMany({
    select: { id: true, password: true },
    orderBy: { id: "asc" },
  });

  for (const connection of migratedConnections) {
    if (!isDatabaseCredentialsPayload(connection.password)) {
      throw new Error(
        `Database connection ${connection.id} still has an unencrypted password`,
      );
    }

    try {
      cipher.decrypt(connection.password);
    } catch {
      throw new Error(
        `Database connection ${connection.id} failed encrypted password verification`,
      );
    }
  }

  console.log(
    `Migration completed: ${encrypted} encrypted, ${alreadyEncrypted} already encrypted, ${migratedConnections.length} verified`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : "Database credential migration failed",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
