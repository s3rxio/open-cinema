import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { S3StorageService } from "../../storage/s3-storage.service";
import { FfmpegService } from "./ffmpeg.service";
import { mkdir, rm } from "fs/promises";
import { ConfigService } from "@nestjs/config";
import { AudioMetaModel } from "../../../../prisma/generated/models";

@Injectable()
export class AudioProcessorService {
  private readonly logger = new Logger(AudioProcessorService.name);

  constructor(
    private ffmpeg: FfmpegService,
    private s3Storage: S3StorageService,
    private configService: ConfigService,
    private prisma: PrismaService
  ) {}

  async processAudio(
    inputPath: string,
    outputDir: string,
    metaId: string
  ): Promise<void> {
    try {
      await mkdir(outputDir, { recursive: true });

      const audioMeta = await this.prisma.audioMeta.findUniqueOrThrow({
        where: {
          id: metaId
        }
      });

      await this.ffmpeg.convertAudioToHLS(inputPath, outputDir);
      await this.uploadToS3(audioMeta, outputDir);

      await this.prisma.audioMeta.update({
        where: {
          id: metaId
        },
        data: {
          url: `${audioMeta.streamId}/audios/${audioMeta.slug}/index.m3u8`,
          bitrate: 128000,
          isProcessed: true
        }
      });

      // Cleanup
      await rm(outputDir, {
        recursive: true,
        force: true
      });
    } catch (error) {
      this.logger.error("Audio processing failed:", error);
      throw error;
    }
  }

  async uploadToS3(audioMeta: AudioMetaModel, playlistDir: string) {
    const bucket = this.configService.getOrThrow("s3.bucket");
    const s3Key = `${audioMeta.streamId}/audios/${audioMeta.slug}`;

    this.s3Storage.uploadFolder({
      bucket,
      folderKey: s3Key,
      folderPath: playlistDir,
      retries: 3
    });
  }
}
