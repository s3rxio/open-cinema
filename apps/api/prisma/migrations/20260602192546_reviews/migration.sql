/*
  Warnings:

  - A unique constraint covering the columns `[user_id,movie_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,series_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "series_id" TEXT,
ALTER COLUMN "movie_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_movie_id_key" ON "reviews"("user_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_series_id_key" ON "reviews"("user_id", "series_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
