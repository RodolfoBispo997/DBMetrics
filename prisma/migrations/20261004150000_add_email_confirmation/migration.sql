ALTER TABLE "users"
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

UPDATE "users"
SET "emailVerifiedAt" = "createdAt"
WHERE "emailVerifiedAt" IS NULL;

CREATE TABLE "email_confirmation_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_confirmation_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "email_confirmation_tokens_tokenHash_key"
ON "email_confirmation_tokens"("tokenHash");

CREATE INDEX "email_confirmation_tokens_userId_usedAt_expiresAt_idx"
ON "email_confirmation_tokens"("userId", "usedAt", "expiresAt");

ALTER TABLE "email_confirmation_tokens"
ADD CONSTRAINT "email_confirmation_tokens_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
