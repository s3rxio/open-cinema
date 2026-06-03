-- AlterTable
ALTER TABLE "episodes" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "series" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;
