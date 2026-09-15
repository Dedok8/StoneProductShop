/*
  Warnings:

  - Added the required column `updated_at` to the `colors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "colors" ADD COLUMN "updated_at" TIMESTAMP(3);

-- Backfill existing rows
UPDATE "colors" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;

-- Enforce NOT NULL
ALTER TABLE "colors" ALTER COLUMN "updated_at" SET NOT NULL;