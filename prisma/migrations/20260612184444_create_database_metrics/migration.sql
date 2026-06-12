-- CreateTable
CREATE TABLE "database_metrics" (
    "id" TEXT NOT NULL,
    "databaseConnectionId" TEXT NOT NULL,
    "databaseVersion" TEXT NOT NULL,
    "tablesCount" INTEGER NOT NULL,
    "databaseSize" BIGINT NOT NULL,
    "activeConnections" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "database_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "database_metrics_databaseConnectionId_createdAt_idx" ON "database_metrics"("databaseConnectionId", "createdAt");

-- AddForeignKey
ALTER TABLE "database_metrics" ADD CONSTRAINT "database_metrics_databaseConnectionId_fkey" FOREIGN KEY ("databaseConnectionId") REFERENCES "database_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
