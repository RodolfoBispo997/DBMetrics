/*
  Warnings:

  - Added the required column `destination` to the `alert_rules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "alert_rules" ADD COLUMN     "destination" TEXT NOT NULL;
