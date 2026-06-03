/*
  Warnings:

  - You are about to drop the column `genre` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `genre` on the `series` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('ANIME', 'DRAMA', 'COMEDY', 'ACTION', 'ADVENTURE', 'SUPERNATURAL', 'FANTASY', 'THRILLER', 'HORROR', 'SCI_FI', 'ROMANCE', 'DOCUMENTARY');

-- AlterTable
ALTER TABLE "movies" DROP COLUMN "genre",
ADD COLUMN     "genres" "Genre"[];

-- AlterTable
ALTER TABLE "series" DROP COLUMN "genre",
ADD COLUMN     "genres" "Genre"[];
