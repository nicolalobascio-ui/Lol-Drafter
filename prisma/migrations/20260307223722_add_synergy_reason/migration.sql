/*
  Warnings:

  - Added the required column `reason` to the `Synergy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Synergy" ADD COLUMN     "reason" TEXT NOT NULL;
