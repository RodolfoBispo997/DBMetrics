/*
  Warnings:

  - Added the required column `functionsCount` to the `database_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `indexesCount` to the `database_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schemasCount` to the `database_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `viewsCount` to the `database_metrics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "database_metrics" ADD COLUMN     "functionsCount" INTEGER NOT NULL,
ADD COLUMN     "indexesCount" INTEGER NOT NULL,
ADD COLUMN     "schemasCount" INTEGER NOT NULL,
ADD COLUMN     "viewsCount" INTEGER NOT NULL;
