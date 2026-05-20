import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { S3StorageService } from "../../storage/s3-storage.service";
import { FfmpegService } from "./ffmpeg.service";
import { join } from "path";
import { tmpdir } from "os";
import { mkdir, rm, unlink } from "fs/promises";
import { deleteFolderRecursive } from "@open-cinema/core";
import { ConfigService } from "@nestjs/config";
import { SubtitleMetaModel } from "../../../../prisma/generated/models";

@Injectable()
export class SubtitleProcessorService {
  private readonly logger = new Logger(SubtitleProcessorService.name);
  constructor(
    private ffmpeg: FfmpegService,
    private s3Storage: S3StorageService,
    private configService: ConfigService,
    private prisma: PrismaService
  ) {}

  async processSubtitle(
    inputPath: string,
    outputDir: string,
    metaId: string
  ): Promise<void> {
    try {
      await mkdir(outputDir, { recursive: true });

      const subtitleMeta = await this.prisma.subtitleMeta.findUniqueOrThrow({
        where: {
          id: metaId
        }
      });

      await this.ffmpeg.convertSubtitle(inputPath, outputDir);
      await this.uploadToS3(subtitleMeta, outputDir);

      await this.prisma.subtitleMeta.update({
        where: {
          id: metaId
        },
        data: {
          url: `${subtitleMeta.streamId}/subtitles/${subtitleMeta.slug}/index.m3u8`,
          isProcessed: true
        }
      });

      // Cleanup
      await rm(outputDir, {
        recursive: true,
        force: true
      });
    } catch (error) {
      this.logger.error("Subtitle processing failed:", error);
      throw error;
    }
  }

  async uploadToS3(subtitleMeta: SubtitleMetaModel, playlistDir: string) {
    const bucket = this.configService.getOrThrow("s3.bucket");
    const s3Key = `${subtitleMeta.streamId}/subtitles/${subtitleMeta.slug}`;

    this.s3Storage.uploadFolder({
      bucket,
      folderKey: s3Key,
      folderPath: playlistDir,
      retries: 3
    });
  }
}
