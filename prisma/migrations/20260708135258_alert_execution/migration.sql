-- CreateEnum
CREATE TYPE "AlertExecutionStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "alert_executions" (
    "id" TEXT NOT NULL,
    "alertRuleId" TEXT NOT NULL,
    "databaseMetricId" TEXT NOT NULL,
    "databaseConnectionId" TEXT NOT NULL,
    "metric" "AlertMetric" NOT NULL,
    "operator" "AlertOperator" NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "AlertExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "alert_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alert_executions_databaseConnectionId_idx" ON "alert_executions"("databaseConnectionId");

-- CreateIndex
CREATE INDEX "alert_executions_alertRuleId_idx" ON "alert_executions"("alertRuleId");

-- CreateIndex
CREATE INDEX "alert_executions_status_idx" ON "alert_executions"("status");

-- AddForeignKey
ALTER TABLE "alert_executions" ADD CONSTRAINT "alert_executions_alertRuleId_fkey" FOREIGN KEY ("alertRuleId") REFERENCES "alert_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_executions" ADD CONSTRAINT "alert_executions_databaseMetricId_fkey" FOREIGN KEY ("databaseMetricId") REFERENCES "database_metrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_executions" ADD CONSTRAINT "alert_executions_databaseConnectionId_fkey" FOREIGN KEY ("databaseConnectionId") REFERENCES "database_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
