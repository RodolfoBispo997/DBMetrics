-- CreateEnum
CREATE TYPE "DatabaseProvider" AS ENUM ('MYSQL', 'POSTGRESQL');

-- CreateTable
CREATE TABLE "database_connections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" "DatabaseProvider" NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "database" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "database_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "database_connections_userId_idx" ON "database_connections"("userId");

-- AddForeignKey
ALTER TABLE "database_connections" ADD CONSTRAINT "database_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
