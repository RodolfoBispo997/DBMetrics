/*
  Warnings:

  - You are about to alter the column `databaseSize` on the `database_metrics` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "database_metrics" ALTER COLUMN "databaseSize" SET DATA TYPE INTEGER;
