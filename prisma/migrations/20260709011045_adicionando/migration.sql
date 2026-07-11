/*
  Warnings:

  - Added the required column `connectionName` to the `alert_executions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `databaseName` to the `alert_executions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `databaseProvider` to the `alert_executions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `host` to the `alert_executions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `port` to the `alert_executions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "alert_executions" ADD COLUMN     "connectionName" TEXT NOT NULL,
ADD COLUMN     "databaseName" TEXT NOT NULL,
ADD COLUMN     "databaseProvider" "DatabaseProvider" NOT NULL,
ADD COLUMN     "host" TEXT NOT NULL,
ADD COLUMN     "port" INTEGER NOT NULL;
