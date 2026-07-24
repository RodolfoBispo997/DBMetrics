import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient, UserRole } from "../generated/prisma/client";

const divider = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

function printHeader(): void {
  console.log(`\n${divider}\n\nDBMetrics Bootstrap\n`);
}

function printFooter(): void {
  console.log(`${divider}\n`);
}

function fail(message: string): never {
  printHeader();
  console.error(`${message}\n`);
  printFooter();
  process.exitCode = 1;
  process.exit(1);
}

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value?.trim()) {
    fail(`Missing environment variable:\n\n${name}`);
  }

  return value;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function main(): Promise<void> {
  const name = getRequiredEnvironmentVariable("ADMIN_NAME");
  const email = normalizeEmail(getRequiredEnvironmentVariable("ADMIN_EMAIL"));
  const password = getRequiredEnvironmentVariable("ADMIN_PASSWORD");
  const prisma = new PrismaClient();

  try {
    const existingAdministrator = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdministrator) {
      printHeader();
      console.log("Administrator already exists.\n\nNothing was changed.\n");
      printFooter();
      return;
    }

    const passwordHash = await hash(password, 8);

    await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: UserRole.ADMIN,
      },
    });

    printHeader();
    console.log(
      `✔ Administrator created successfully.\n\nEmail: ${email}\nRole : ${UserRole.ADMIN}\n`,
    );
    printFooter();
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error: unknown) => {
    fail(error instanceof Error ? error.message : "Administrator bootstrap failed");
  })
