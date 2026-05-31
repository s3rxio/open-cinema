-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_series_id_fkey";

-- AlterTable
ALTER TABLE "favorites" ALTER COLUMN "movie_id" DROP NOT NULL,
ALTER COLUMN "series_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
