/*
  Warnings:

  - Added the required column `episode` to the `episodes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "episodes" ADD COLUMN     "episode" INTEGER NOT NULL;
