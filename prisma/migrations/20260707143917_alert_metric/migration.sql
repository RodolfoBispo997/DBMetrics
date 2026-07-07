-- CreateEnum
CREATE TYPE "AlertMetric" AS ENUM ('DATABASE_SIZE', 'ACTIVE_CONNECTIONS', 'TABLES_COUNT', 'VIEWS_COUNT', 'SCHEMAS_COUNT', 'INDEXES_COUNT', 'FUNCTIONS_COUNT');

-- CreateEnum
CREATE TYPE "AlertOperator" AS ENUM ('GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL', 'EQUAL', 'NOT_EQUAL');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('WHATSAPP', 'EMAIL', 'DISCORD', 'WEBHOOK');

-- CreateTable
CREATE TABLE "alert_rules" (
    "id" TEXT NOT NULL,
    "metric" "AlertMetric" NOT NULL,
    "operator" "AlertOperator" NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "databaseConnectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alert_rules_databaseConnectionId_idx" ON "alert_rules"("databaseConnectionId");

-- AddForeignKey
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_databaseConnectionId_fkey" FOREIGN KEY ("databaseConnectionId") REFERENCES "database_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
