-- CreateEnum
CREATE TYPE "AlertRuleState" AS ENUM ('NORMAL', 'TRIGGERED');

-- AlterTable
ALTER TABLE "alert_rules"
ADD COLUMN "cooldownMinutes" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN "currentState" "AlertRuleState" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN "lastNotificationAt" TIMESTAMP(3);
