/*
  Warnings:

  - You are about to drop the column `posterUrl` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `posterUrl` on the `series` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "movies" DROP COLUMN "posterUrl",
ADD COLUMN     "banner_url" TEXT,
ADD COLUMN     "poster_url" TEXT;

-- AlterTable
ALTER TABLE "series" DROP COLUMN "posterUrl",
ADD COLUMN     "banner_url" TEXT,
ADD COLUMN     "poster_url" TEXT;
