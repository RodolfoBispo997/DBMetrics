/*
  Warnings:

  - Added the required column `destination` to the `alert_executions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "alert_executions" ADD COLUMN     "destination" TEXT NOT NULL;
