-- AlterTable
ALTER TABLE "episodes" ADD COLUMN     "streamId" TEXT;

-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "streamId" TEXT;

-- CreateTable
CREATE TABLE "video_metas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "bitrate" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "streamId" TEXT NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "video_metas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_metas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "orderNumer" INTEGER NOT NULL,
    "bitrate" INTEGER NOT NULL,
    "streamId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "audio_metas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtitle_metas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "orderNumer" INTEGER NOT NULL,
    "streamId" TEXT NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "subtitle_metas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streams" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "streams_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "movies_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "streams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "streams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_metas" ADD CONSTRAINT "video_metas_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "streams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_metas" ADD CONSTRAINT "audio_metas_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "streams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtitle_metas" ADD CONSTRAINT "subtitle_metas_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "streams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
