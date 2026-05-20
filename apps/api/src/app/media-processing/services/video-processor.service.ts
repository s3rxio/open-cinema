import { Injectable, Logger } from "@nestjs/common";
import { FfmpegService } from "./ffmpeg.service";
import { FfprobeService } from "./ffprobe.service";
import { mkdir, rm, unlink } from "fs/promises";
import { join } from "path";
import { VideoQuality } from "../types";
import { S3StorageService } from "../../storage/s3-storage.service";
import { ConfigService } from "@nestjs/config";
import { BITRATE_MAP } from "../constants/bitrate-map";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class VideoProcessorService {
  private readonly logger = new Logger(VideoProcessorService.name);

  constructor(
    private ffmpeg: FfmpegService,
    private ffprobe: FfprobeService,
    private s3Storage: S3StorageService,
    private configService: ConfigService,
    private prisma: PrismaService
  ) {}

  async processVideo(
    inputPath: string,
    outputDir: string,
    streamId: string
  ): Promise<void> {
    try {
      await mkdir(outputDir, { recursive: true });

      // Probe video
      const probeResult = await this.ffprobe.probe(inputPath);
      const availableQualities = await this.ffprobe.getAvailableQualities(
        probeResult.height
      );

      // Process each quality
      for (const quality of availableQualities) {
        const qualityDir = join(outputDir, quality);

        await mkdir(qualityDir, { recursive: true });

        await this.ffmpeg.convertVideoToHLS(inputPath, qualityDir, quality);
        await this.uploadQualityToS3(streamId, quality, qualityDir);
        await this.createVideoMetaFromQuality(streamId, quality);
      }

      // Cleanup
      await rm(outputDir, {
        recursive: true,
        force: true
      });
    } catch (error) {
      this.logger.error("Video processing failed:", error);
      throw error;
    }
  }

  async uploadQualityToS3(
    streamId: string,
    quality: VideoQuality,
    qualityDir: string
  ) {
    const bucket = this.configService.getOrThrow("s3.bucket");
    const s3Key = `${streamId}/videos/${quality}`;
    this.s3Storage.uploadFolder({
      bucket,
      folderKey: s3Key,
      folderPath: qualityDir,
      retries: 3
    });
  }

  async createVideoMetaFromQuality(streamId: string, quality: VideoQuality) {
    const config = BITRATE_MAP[quality];
    return this.prisma.videoMeta.create({
      data: {
        displayName: config.displayName,
        slug: quality,
        url: `${streamId}/videos/${quality}/index.m3u8`,
        width: config.width,
        height: config.height,
        bitrate: Number(config.bitrate.slice(0, -1)) * 1000,
        isProcessed: true,
        stream: {
          connect: {
            id: streamId
          }
        }
      }
    });
  }
}
